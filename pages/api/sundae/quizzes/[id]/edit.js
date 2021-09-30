import axios from 'axios';
import { getSession } from 'next-auth/client';

async function editQuiz(quizId, mutableData, sessionId) {
  const {
    quizType, title, imageUrl, isPublished, seriesId
  } = mutableData;

  const seriesIdData = seriesId ? `seriesId: "${seriesId}",` : '';
  const titleData = title ? `title: ${JSON.stringify(title)},` : '';
  const quizTypeData = quizType ? `quizType: ${quizType},` : '';
  const imageUrlData = imageUrl ? `imageUrl: "${imageUrl}",` : '';
  const isPublishedData = isPublished ? `isPublished: ${isPublished},` : '';

  const mutation = `mutation {
    updateQuiz(input: {
      quizId: "${quizId}",
      ${seriesIdData}
      ${titleData}
      ${quizTypeData}
      ${imageUrlData}
      ${isPublishedData}
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
  const { updateQuiz } = data;
  return {
    errors: null,
    quiz: updateQuiz
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { id } = req.query;
    const resp = await editQuiz(id, req.body, sessionId);
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
