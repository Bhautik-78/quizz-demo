import axios from 'axios';
import { getSession } from 'next-auth/client';

async function sendAnswer(quizId, input, sessionId) {
  const questions = input.questions.map((question) => `{
      questionId: "${question.questionId}",
      score: ${question.score},
      optionsIds: [${question.optionsIds.map((option) => `"${option}"`)}]
    }`);

  const query = `mutation {
    sendAnswers(input: { quizId: "${quizId}", questions: [${questions}] }) {
      id
      result
      scoreMax
      scoreMin
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
      sendAnswers: null
    };
  }
  const { sendAnswers } = data;
  return {
    errors: null,
    sendAnswers
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { id } = req.query;
    const resp = await sendAnswer(id, req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { sendAnswers } = resp;
      res.send({
        sendAnswers
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
