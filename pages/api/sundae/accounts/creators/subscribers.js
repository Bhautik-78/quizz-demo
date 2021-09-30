import axios from 'axios';
import { getSession } from 'next-auth/client';

async function creatorSubscriptions(sessionId) {
  const query = `query {
    getCreatorSubscriptions {
      id
      startDate
      expiresOn
      isRemoved
      user {
        id
        firstName
        lastName
        email
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
      userSubscriptions: null
    };
  }

  const { getCreatorSubscriptions } = data;
  return {
    errors: null,
    userSubscriptions: getCreatorSubscriptions
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await creatorSubscriptions(sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { userSubscriptions } = resp;
      res.send({
        userSubscriptions
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
