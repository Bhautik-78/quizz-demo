import axios from 'axios';
import { getSession } from 'next-auth/client';

async function getQuizzes(seriesId, sessionId) {
  const query = `query {
    getQuizzes(creatorId: "", input: { seriesId: "${seriesId}", isForBackOffice: true }) {
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
      quizzes: null
    };
  }
  const { getQuizzes } = data;
  return {
    errors: null,
    quizzes: getQuizzes
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId, sundaeUser } = session.user;
    if (!sundaeUser.creator) {
      res.send({
        errorMessage: 'You are not a creator, only creators can access this page'
      });
    }
    const { seriesId } = req.body;
    const resp = await getQuizzes(seriesId, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { quizzes } = resp;
      res.send({
        quizzes
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
