import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function getLoginLink(sessionId) {
  const query = `query {
    getStripeAccountLoginLink
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
      loginLink: null
    };
  }
  const { getStripeAccountLoginLink } = data;
  return {
    errors: null,
    loginLink: JSON.parse(getStripeAccountLoginLink)
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
    const resp = await getLoginLink(sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { loginLink } = resp;
      res.send({
        loginLink
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
