import axios from 'axios';
import { getSession } from 'next-auth/client';

async function quizQuestion(id, sessionId) {
  const query = `query {
    getQuizQuestion(id: "${id}") {
      id
      questionText
      isSingleAnswer
      position
      isDeleted
      options {
        id
        optionText
        score
        nextQuestionId
        position
        isDeleted
      }
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
      question: null
    };
  }
  const { getQuizQuestion } = data;
  return {
    errors: null,
    question: getQuizQuestion
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { questionId } = req.query;
    const resp = await quizQuestion(questionId, sessionId);
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
