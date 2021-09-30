import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function getAccountLink(linkData, sessionId) {
  const { accountId } = linkData;
  const query = `query {
    getStripeAccountLinks(input: {
      accountId: "${accountId}",
      refreshUrl: "${process.env.NEXTAUTH_URL}/payments/refresh",
      returnUrl: "${process.env.NEXTAUTH_URL}/settings"
    })
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
      accountLink: null
    };
  }
  const { getStripeAccountLinks } = data;
  return {
    errors: null,
    accountLink: JSON.parse(getStripeAccountLinks)
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
    const resp = await getAccountLink(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { accountLink } = resp;
      res.send({
        accountLink
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
