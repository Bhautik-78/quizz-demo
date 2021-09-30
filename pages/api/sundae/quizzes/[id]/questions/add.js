import axios from 'axios';
import { getSession } from 'next-auth/client';

async function addQuizQuestion(quizId, mutableData, sessionId) {
  const {
    questionText, isSingleAnswer, parentQuestionId, position
  } = mutableData;
  const parentQustionIdData = parentQuestionId ? `parentQuestionId: "${parentQuestionId}"` : '';
  const mutation = `mutation {
    addQuestion(input: {
      quizId: "${quizId}",
      isSingleAnswer: ${isSingleAnswer},
      questionText: ${JSON.stringify(questionText)},
      position: ${position},
      ${parentQustionIdData}
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
  const { addQuestion } = data;
  return {
    errors: null,
    question: addQuestion
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { id } = req.query;
    const resp = await addQuizQuestion(id, req.body, sessionId);
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
