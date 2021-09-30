import axios from 'axios';
import { getSession } from 'next-auth/client';

async function deleteQuestion(questionId, sessionId) {
  const mutation = `mutation {
    deleteQuestion(id: "${questionId}")
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
  const { deleteQuestion } = data;
  return {
    errors: null,
    deleted: deleteQuestion
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { questionId } = req.query;
    const resp = await deleteQuestion(questionId, sessionId);
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
