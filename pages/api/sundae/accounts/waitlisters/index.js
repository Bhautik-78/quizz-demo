import axios from 'axios';
import { getSession } from 'next-auth/client';

async function creatorWaitlisters(sessionId) {
  const query = `query {
    getWaitlisters {
      id
      user {
        firstName
        lastName
        email
      }
      offering
      offeringType
      createdAt
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
      waitlisters: null
    };
  }

  const { getWaitlisters } = data;
  return {
    errors: null,
    waitlisters: getWaitlisters
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await creatorWaitlisters(sessionId);
    if (resp.errors) {
      res.sessionId({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { waitlisters } = resp;
      res.send({
        waitlisters
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
