import axios from 'axios';
import { getSession } from 'next-auth/client';

async function quizResult(id, sessionId) {
  const query = `query {
    getQuizResult(id: "${id}") {
      id
      result
      scoreMin
      scoreMax
      position
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
      quizResult: null
    };
  }
  const { getQuizResult } = data;
  return {
    errors: null,
    quizResult: getQuizResult
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { quizResultId } = req.query;
    const resp = await quizResult(quizResultId, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { quizResult } = resp;
      res.send({
        quizResult
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
