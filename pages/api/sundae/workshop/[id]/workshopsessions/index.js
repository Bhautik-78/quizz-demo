import axios from 'axios';
import { getSession } from 'next-auth/client';

async function getWorkshopSessions(workshopId, sessionId) {
  const query = `query {
    workshopSessions(workshopId: "${workshopId}") {
      id
      handle
      title
      sessionNumber
      redirectUrl
      description
      isPublished

      createdAt
      updatedAt
    }
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
      workshopSessions: null
    };
  }

  const { workshopSessions } = data;
  return {
    errors: null,
    workshopSessions
  };
} 

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;

    const { id } = req.query;
    const resp = await getWorkshopSessions(id,
      sessionId);

    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { workshopSessions } = resp;
      res.send({
        workshopSessions
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
