import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function getCustomerPortalLink(sessionId) {
  const query = `query {
    getStripeCustomerBillingLink(input: {
      returnUrl: "${process.env.NEXTAUTH_URL}/subscriptions"
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
      link: null
    };
  }

  const { getStripeCustomerBillingLink } = data;
  return {
    errors: null,
    link: getStripeCustomerBillingLink
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await getCustomerPortalLink(sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { link } = resp;
      res.send({
        link
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
