import axios from 'axios';
import { getSession } from 'next-auth/client';

async function editWorkshopSession(mutatbleData, sessionId) {
  const {
    id,
    title,
    sessionNumber,
    redirectUrl,
    description,
    isPublished,
    workshopId
  } = mutatbleData;
  const mutation = `mutation {
    updateWorkshopSession(input: {
      id: "${id}",
      title: ${JSON.stringify(title)},
      sessionNumber: ${sessionNumber},
      ${redirectUrl ? `redirectUrl: "${redirectUrl}",` : ''}
      description: ${JSON.stringify(description)},
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
    console.log(JSON.stringify(errors), 'errors............');
    return {
      errors,
      workshopSession: null
    };
  }
  const { updateWorkshopSession } = data;
  return {
    errors: null,
    workshopSession: updateWorkshopSession
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    console.log(req.body, 'body...............');
    const resp = await editWorkshopSession(req.body, sessionId);
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
