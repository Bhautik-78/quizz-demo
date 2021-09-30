import axios from 'axios';
import { getSession } from 'next-auth/client';

async function sendNotificationByCreator(notifData, sessionId) {
  const {
    body, title,
    isTest, episodeId,
    seriesId
  } = notifData;
  let redirectObj = '';
  if (episodeId) {
    redirectObj = `,episodeId: "${episodeId}"`;
  } else if (seriesId) {
    redirectObj = `,seriesId: "${seriesId}"`;
  }
  const mutation = `mutation {
    sendNotificationByCreator(input: {
      body: ${JSON.stringify(body)},
      title: ${JSON.stringify(title)},
      isTest: ${isTest}
      ${redirectObj}
    })
  }`;
  const resp = await axios.post(process.env.BACKEND_URL, {
    query: mutation
  }, {
    headers: {
      'X-Session': sessionId
    }
  });

  const { errors } = resp.data;
  if (errors) {
    console.log(errors);
    return {
      errors,
      notificationSent: false
    };
  }
  return {
    errors: null,
    notificationSent: true
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await sendNotificationByCreator(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { notificationSent } = resp;
      res.send({
        notificationSent
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
