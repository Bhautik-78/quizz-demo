import axios from 'axios';
import { getSession } from 'next-auth/client';

async function editQuestion(questionId, mutableData, sessionId) {
  const {
    questionText, isSingleAnswer, parentQuestionId, position
  } = mutableData;

  const questionTextData = questionText ? `questionText: ${JSON.stringify(questionText)},` : '';
  const isSingleAnswerData = isSingleAnswer ? `isSingleAnswer: ${isSingleAnswer},` : '';
  const parentQustionIdData = parentQuestionId ? `parentQuestionId: "${parentQuestionId}",` : '';
  const positionData = position ? `position: ${position},` : '';

  const mutation = `mutation {
    updateQuestion(input: {
      questionId: "${questionId}",
      ${questionTextData}
      ${isSingleAnswerData}
      ${parentQustionIdData}
      ${positionData}
    }) {
      id
      quizId
      questionText
      isSingleAnswer
      position
      isDeleted
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
      question: null
    };
  }
  const { updateQuestion } = data;
  return {
    errors: null,
    question: updateQuestion
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { questionId } = req.query;
    const resp = await editQuestion(questionId, req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { question } = resp;
      res.send({
        question
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
