import axios from 'axios';
import { getSession } from 'next-auth/client';

async function updateLanding(id, mutableData, sessionId) {
  const { workshopLandingPageData } = mutableData;
  const mutation = `mutation {
    updateCreator(input: {
    creatorId: "${id}",
    workshopLandingPageData: ${JSON.stringify(workshopLandingPageData)}
    }) {
        id
    }
  }`;
  const resp = await axios.post(
    process.env.BACKEND_URL,
    {
      query: mutation,
    },
    {
      headers: {
        'X-Session': sessionId,
      },
    }
  );

  const { data, errors } = resp.data;
  if (errors) {
    return {
      errors,
      creator: null,
    };
  }
  const { updateCreator } = data;
  return {
    errors: null,
    creator: updateCreator,
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    // console.log(req.body);
    const { sessionId } = session.user;
    // console.log(sessionId, 'session-id');
    const resp = await updateLanding(req.body.id, req.body, sessionId);
    if (resp.errors) {
      console.log(resp.errors);
      res.send({
        errorMessage: resp.errors[0].message,
      });
    } else {
      const { creator } = resp;
      res.send({
        content: JSON.stringify(creator),
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in',
    });
  }
};
