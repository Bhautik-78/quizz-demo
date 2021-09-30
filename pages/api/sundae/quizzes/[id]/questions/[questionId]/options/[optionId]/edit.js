import axios from 'axios';
import { getSession } from 'next-auth/client';

async function editQuizOption(optionId, mutableData, sessionId) {
  const {
    optionText, score, nextQuestionId, quizResultId, position
  } = mutableData;
  const optionTextData = optionText ? `optionText: ${JSON.stringify(optionText)},` : '';
  const scoreData = score ? `score: ${score},` : '';
  const nextQuestionIdData = nextQuestionId ? `nextQuestionId: "${nextQuestionId}",` : '';
  const quizResultIdData = quizResultId ? `quizResultId: "${quizResultId}",` : '';
  const positionData = position ? `position: ${position},` : '';

  const mutation = `mutation {
    updateOption(input: {
      optionsId: "${optionId}",
      ${positionData},
      ${optionTextData},
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
  const { updateOption } = data;
  return {
    errors: null,
    option: updateOption
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { optionId } = req.query;
    const resp = await editQuizOption(optionId, req.body, sessionId);
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
