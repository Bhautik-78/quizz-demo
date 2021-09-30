import axios from 'axios';
import { getSession } from 'next-auth/client';

async function getQuiz(id, sessionId) {
  const query = `query {
    getQuiz(id: "${id}", input: { isForBackOffice: true }) {
      id
      creatorId
      title
      imageUrl
      quizType
      position
      isPublished
      isDeleted
      createdAt
      updatedAt
      questions {
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
      quiz: null
    };
  }
  const { getQuiz } = data;
  return {
    errors: null,
    quiz: getQuiz
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { id } = req.query;
    const resp = await getQuiz(id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { quiz } = resp;
      res.send({
        quiz
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
