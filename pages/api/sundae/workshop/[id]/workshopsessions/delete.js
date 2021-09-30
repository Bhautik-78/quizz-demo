import axios from 'axios';
import { getSession } from 'next-auth/client';

async function deleteWorkshopSessionById(id, sessionId) {
  const mutation = `mutation {
    deleteWorkshopSession(id: "${id}") {
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
  const { deleteWorkshopSession } = data;
  return {
    errors: null,
    workshopSession: deleteWorkshopSession
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { id } = req.query;
    const resp = await deleteWorkshopSessionById(id, sessionId);
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
      errorMessage: 'You need to be signed in'
    });
  }
}