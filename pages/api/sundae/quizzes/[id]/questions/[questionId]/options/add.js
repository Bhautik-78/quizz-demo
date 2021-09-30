import axios from 'axios';
import { getSession } from 'next-auth/client';

async function addQuizOption(questionId, mutableData, sessionId) {
  const {
    optionText, score, nextQuestionId, quizResultId, position
  } = mutableData;
  const scoreData = score !== undefined ? `score: ${score},` : '';
  const nextQuestionIdData = nextQuestionId ? `nextQuestionId: "${nextQuestionId}",` : '';
  const quizResultIdData = quizResultId ? `quizResultId: "${quizResultId}",` : '';

  const mutation = `mutation {
    addOption(input: {
      questionId: "${questionId}",
      optionText: ${JSON.stringify(optionText)},
      position: ${position},
      ${scoreData}
      ${nextQuestionIdData}
      ${quizResultIdData}
    }) {
      id
      questionId
      optionText
      score
      nextQuestionId
      quizResultId
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
      option: null
    };
  }
  const { addOption } = data;
  return {
    errors: null,
    option: addOption
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { questionId } = req.query;
    const resp = await addQuizOption(questionId, req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { option } = resp;
      res.send({
        option
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
