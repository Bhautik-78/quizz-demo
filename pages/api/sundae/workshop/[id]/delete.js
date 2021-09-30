import axios from 'axios';
import { getSession } from 'next-auth/client';

async function deleteWorkshopById(id, sessionId) {
  const mutation = `mutation {
    deleteWorkshop(id: "${id}") {
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
      workshop: null
    };
  }
  const { deleteWorkshop } = data;
  return {
    errors: null,
    workshop: deleteWorkshop
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { id } = req.query;
    const resp = await deleteWorkshopById(id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { workshop } = resp;
      res.send({
        workshop
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
}