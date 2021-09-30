/* eslint-disable camelcase */
import axios from 'axios';
import { getSession } from 'next-auth/client';

async function updateCreator(creatorData, sessionId, creatorId) {
  const {
    creatorDescription, creatorTitle,
    creatorTagline, price, imageUrl,
    landscape_imageUrl, disclaimerUrl
  } = creatorData;
  const mutation = `mutation {
    updateCreator(input: {
      creatorId: "${creatorId}",
      ${creatorDescription ? `creatorDescription: ${JSON.stringify(creatorDescription)}` : ''}
      ${creatorTitle ? `creatorTitle: "${creatorTitle}",` : ''}
      ${creatorTagline ? `creatorTagline: ${JSON.stringify(creatorTagline)},` : ''}
      ${price ? `price: "${price}",` : ''}
      ${imageUrl ? `imageUrl: "${imageUrl}",` : ''}
      ${landscape_imageUrl ? `landscape_imageUrl: "${landscape_imageUrl}",` : ''}
      ${disclaimerUrl ? `disclaimerUrl: "${disclaimerUrl}"` : ''}
    }) {
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
      creator: null
    };
  }

  const { updateCreator } = data;
  return {
    errors: null,
    creator: updateCreator
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId, sundaeUser } = session.user;
    const { creator } = sundaeUser;
    const resp = await updateCreator(req.body, sessionId, creator.id);
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
