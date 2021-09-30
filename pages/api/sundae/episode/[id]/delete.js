import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function deleteEpisode(id, sessionId) {
  const mutation = `mutation {
    deleteEpisode(id: "${id}") {
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
      episode: null
    };
  }

  const { deleteEpisode } = data;
  return {
    errors: null,
    episode: deleteEpisode
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { id } = req.query;
    const resp = await deleteEpisode(id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { episode } = resp;
      res.send({
        episode
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
