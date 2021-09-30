import axios from 'axios';
import { getSession } from 'next-auth/client';

async function sendEmail(emailData, sessionId) {
  const {
    offeringId, offeringType,
    test, emailSubject,
    emailBody
  } = emailData;
  const query = `mutation {
    sendEmailToLeads(input: {
      ${offeringId ? `offeringId: "${offeringId}",` : ''}
      ${offeringType ? `offeringType: ${offeringType},` : ''}
      test: ${test},
      emailSubject: ${JSON.stringify(emailSubject)},
      emailBody: ${JSON.stringify(emailBody)}
    })
  }`;
  const resp = await axios.post(process.env.BACKEND_URL, {
    query
  }, {
    headers: {
      'X-Session': sessionId
    }
  });

  const { data, errors } = resp.data;
  if (errors) {
    return {
      errors,
      emailSent: false
    };
  }

  const { sendEmailToLeads } = data;
  return {
    errors: null,
    emailSent: sendEmailToLeads
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await sendEmail(req.body, sessionId);
    if (resp.errors) {
      res.sessionId({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { emailSent } = resp;
      res.send({
        emailSent
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
