import axios from 'axios';
import { getSession } from 'next-auth/client';

async function createWorkshopSession(mutatbleData, sessionId) {
  const {
    title,
    sessionNumber,
    redirectUrl,
    description,
    isPublished,
    workshopId
  } = mutatbleData;
  const mutation = `mutation {
    addWorkshopSession(input: {
      title: ${JSON.stringify(title)},
      sessionNumber: ${sessionNumber},
      ${redirectUrl ? `redirectUrl: "${redirectUrl}",` : ''}
      description: ${JSON.stringify(description)}
      isPublished: ${isPublished},
      workshopId: "${workshopId}"
    }) {
      id
    }
  }`;
  const resp = await axios.post(process.env.BACKEND_URL, {
    query: mutation
  }, {
    headers: {
      'X-Session': sessionId
    }
  });

  const { data, errors } = resp.data;
  if (errors) {
    return {
      errors,
      workshopSession: null
    };
  }
  const { addWorkshopSession } = data;
  return {
    errors: null,
    workshopSession: addWorkshopSession
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await createWorkshopSession(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { workshopSession } = resp;
      res.send({
        workshopSession
      });
    }
  } else {
    res.send({
      errorMessagE: 'You need to be signed in'
    });
  }
};
