import axios from 'axios';

async function subscribe(subscriptionId, sessionId) {
  const mutation = `mutation {
    subscribe(input: {
      platform: STRIPE,
      paymentData: "${subscriptionId}"
    }) {
      id
    }
  }`;
  const resp = await axios.post(process.env.BACKEND_URL, {
    query: mutation
  }, {
    headers: {
      'X-Session': sessionId
    }
  });
  console.log(resp.data);
  const { data, errors } = resp.data;
  if (errors){
    return {
      errors,
      userSubscription: null
    }
  }
  const { subscribe } = data;
  return {
    errors: null,
    userSubscription: subscribe
  }
}

export default async (req, res) => {
  console.log(req.body);
  const { sessionId, subscriptionId } = req.body;
  const resp = await subscribe(subscriptionId, sessionId);
  if (resp.errors) {
    res.send({
      errorMessage: resp.errors[0].message
    });
  } else {
    const { userSubscription } = resp;
    res.send({
      userSubscription
    });
  }
}