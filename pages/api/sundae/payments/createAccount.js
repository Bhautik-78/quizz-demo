import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function createAccount(sessionId) {
  const mutation = `mutation {
    createStripeConnectAccount
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
      account: null
    };
  }
  const { createStripeConnectAccount } = data;
  return {
    errors: null,
    account: JSON.parse(createStripeConnectAccount)
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
    const resp = await createAccount(sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { account } = resp;
      res.send({
        account
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
