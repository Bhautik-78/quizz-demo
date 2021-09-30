import axios from 'axios';
import { getSession } from 'next-auth/client';

async function getSubscriptionsForUser(sessionId) {
  const query = `query {
    getSubscriptions(first: 10) {
      edges {
        node {
          id
          stripeSubId
          expiresOn
          isRemoved
          creator: subscribedCreator {
            id
            creatorTitle
            creatorDescription
            creatorTagline
            price
          }
        }
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

  const { getSubscriptions } = data;
  return {
    errors: null,
    userSubscriptions: getSubscriptions
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await getSubscriptionsForUser(sessionId);
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
