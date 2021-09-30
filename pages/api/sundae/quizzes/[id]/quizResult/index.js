import axios from 'axios';
import { getSession } from 'next-auth/client';

async function quizResults(id, sessionId) {
  const query = `query {
    getQuizResults(quizId: "${id}") {
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
      quizResults: null
    };
  }
  const { getQuizResults } = data;
  return {
    errors: null,
    quizResults: getQuizResults
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { id } = req.query;
    const resp = await quizResults(id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { quizResults } = resp;
      res.send({
        quizResults
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
