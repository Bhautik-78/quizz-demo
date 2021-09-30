import axios from 'axios';
import { getSession } from 'next-auth/client';

async function creatorById(creatorId, sessionId) {
  const query = `query {
    creator(id: "${creatorId}") {
      id
      creatorTitle
      creatorDescription
      creatorTagline
      price
      imageUrl
      landscape_imageUrl
      userSubscriptionCount
      applicationStatus
      applicationStartDate
      trialText
      promoOfferText
      disclaimerUrl
      subscriberOnboardingMessage

      createdAt
      updatedAt
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
      creator: null
    };
  }
  const { creator } = data;
  return {
    errors: null,
    creator
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId, sundaeUser } = session.user;
    const resp = await creatorById(sundaeUser.creator.id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { creator } = resp;
      res.send({
        creator
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
