import axios from 'axios';
import { getSession } from 'next-auth/client';

async function sendEmailByCreator(emailData, sessionId) {
  const { workshopId, emailBody, emailSubject, test } = emailData;
  const mutation = `mutation {
    sendEmailToWorkshopSubscribers(input: {
      workshopId: ${JSON.stringify(workshopId)},
      emailBody: ${JSON.stringify(emailBody)},
      emailSubject: ${JSON.stringify(emailSubject)},
      test : ${test}
    })
  }`;
  const resp = await axios.post(
    process.env.BACKEND_URL,
    {
      query: mutation,
    },
    {
      headers: {
        'X-Session': sessionId,
      },
    }
  );

  const { errors } = resp.data;
  if (errors) {
    console.log(errors);
    return {
      errors,
      emailSent: false,
    };
  }
  return {
    errors: null,
    emailSent: true,
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await sendEmailByCreator(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message,
      });
    } else {
      const { emailSent } = resp;
      res.send({
        emailSent,
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in',
    });
  }
};
