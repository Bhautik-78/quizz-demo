import axios from 'axios';
import { getSession } from 'next-auth/client';

async function quizOption(id, sessionId) {
  const query = `query {
    getQuizOption(id: "${id}") {
      id
      optionText
      score
      nextQuestionId
      position
      isDeleted
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
      quizOption: null
    };
  }
  const { getQuizOption } = data;
  return {
    errors: null,
    quizOption: getQuizOption
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { optionId } = req.query;
    const resp = await quizOption(optionId, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { quizOption } = resp;
      res.send({
        quizOption
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
