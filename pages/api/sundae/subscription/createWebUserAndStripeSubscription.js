import axios from 'axios';

async function createWebUserAndStripeSubscription(inputData) {
  const {
    email, paymentMethodId,
    creatorId, otherInfoJson
  } = inputData;
  const query = `mutation {
    createWebUserAndStripeSubscription(input:{
        email: "${email}",
        paymentMethodId: "${paymentMethodId}",
        creatorId:"${creatorId}",
        otherInfoJson: ${JSON.stringify(otherInfoJson)}
    }) {
      session {
        sessionId
      }
      subscriptionJson
      isSubscriberAlready
    }   
  }`;
  const resp = await axios.post(process.env.BACKEND_URL, {
    query
  }, {
    headers: {
      'X-Web-Auth': process.env.SUNDAE_WEB_AUTH
    }
  });

  const { data, errors } = resp.data;
  console.log(JSON.stringify(resp.data));
  if (errors) {
    return {
      errors,
      sessionId: null,
      subscriptionJson: null,
      isSubscriberAlready: false
    };
  }
  const { createWebUserAndStripeSubscription } = data;
  const { subscriptionJson, isSubscriberAlready } = createWebUserAndStripeSubscription;
  return {
    errors: null,
    sessionId: createWebUserAndStripeSubscription.session.sessionId,
    subscriptionJson,
    isSubscriberAlready
  };
}

export default async (req, res) => {
  const resp = await createWebUserAndStripeSubscription(req.body);
  if (resp.errors) {
    res.send({
      errorMessage: resp.errors[0].message
    });
  } else {
    const {
      sessionId, subscriptionJson,
      isSubscriberAlready
    } = resp;
    if (!sessionId) {
      res.send({
        errorMessage: 'Something went wrong'
      });
      return;
    }
    res.send({
      sessionId,
      subscriptionJson,
      isSubscriberAlready
    });
  }
};
