import axios from 'axios';
import { getSession } from 'next-auth/client';

async function editQuizResult(quizResultId, mutableData, sessionId) {
  const {
    result, scoreMin, scoreMax, questionOptionId
  } = mutableData;

  const resultData = result ? `result: ${JSON.stringify(result)},` : '';
  const scoreMinData = scoreMin ? `scoreMin: ${scoreMin},` : '';
  const scoreMaxData = scoreMax ? `scoreMax: ${scoreMax},` : '';
  const questionOptionIdData = questionOptionId ? `questionOptionId: ${questionOptionId},` : '';

  const mutation = `mutation {
    updateQuizResult(input: {
      quizResultId: "${quizResultId}",
      ${resultData},
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
      updateQuizResult: null
    };
  }
  const { updateQuizResult } = data;
  return {
    errors: null,
    updateQuizResult
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { quizResultId } = req.query;
    const resp = await editQuizResult(quizResultId, req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { updateQuizResult } = resp;
      res.send({
        updateQuizResult
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
