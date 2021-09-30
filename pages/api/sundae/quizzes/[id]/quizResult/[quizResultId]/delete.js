import axios from 'axios';
import { getSession } from 'next-auth/client';

async function deleteQuizResult(quizResultId, sessionId) {
  const mutation = `mutation {
    deleteQuizResult(id: "${quizResultId}")
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
      deleted: false
    };
  }
  const { deleteQuizResult } = data;
  return {
    errors: null,
    deleted: deleteQuizResult
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { quizResultId } = req.query;
    const resp = await deleteQuizResult(quizResultId, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { deleted } = resp;
      res.send({
        deleted
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
