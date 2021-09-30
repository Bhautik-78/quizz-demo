import axios from 'axios';
import { getSession } from 'next-auth/client';

async function addQuiz(creatorId, mutableData, sessionId) {
  const {
    quizType, title, imageUrl, isPublished, seriesId
  } = mutableData;
  const mutation = `mutation {
    createQuiz(input: {
      creatorId: "${creatorId}",
      seriesId: "${seriesId}",
      title: ${JSON.stringify(title)},
      quizType: ${quizType},
      imageUrl: "${imageUrl}",
      isPublished: ${isPublished}
    }) {
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
      quiz: null
    };
  }
  const { createQuiz } = data;
  return {
    errors: null,
    quiz: createQuiz
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
    const resp = await addQuiz(sundaeUser.creator.id, req.body, sessionId);
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
