import axios from 'axios';
import { getSession } from 'next-auth/client';

async function addQuizResult(quizId, mutableData, sessionId) {
  const {
    result, scoreMin, scoreMax, questionOptionId
  } = mutableData;

  const scoreMinData = scoreMin ? `scoreMin: ${scoreMin},` : '';
  const scoreMaxData = scoreMax ? `scoreMax: ${scoreMax},` : '';
  const questionOptionIdData = questionOptionId ? `questionOptionId: ${questionOptionId},` : '';

  const mutation = `mutation {
    addQuizResult(input: {
      quizId: "${quizId}",
      result: ${JSON.stringify(result)},
      ${scoreMinData}
      ${scoreMaxData}
      ${questionOptionIdData}
    }) {
      id
      result
      scoreMin
      scoreMax
      position
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
      addQuizResult: null
    };
  }
  const { addQuizResult } = data;
  return {
    errors: null,
    addQuizResult
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { id } = req.query;
    const resp = await addQuizResult(id, req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { addQuizResult } = resp;
      res.send({
        addQuizResult
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
