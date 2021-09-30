import axios from 'axios';

async function createWorkshopSession(inputData) {
  const {
    workshopId, successUrl, cancelUrl, email
  } = inputData;
  const query = `mutation {
    createStripeCheckoutSession(input:{
        workshopId: "${workshopId}",
        successUrl: "${successUrl}",
        cancelUrl:"${cancelUrl}",
        ${email ? `email: "${email}"` : ''}
    })   
  }`;
  const resp = await axios.post(
    process.env.BACKEND_URL,
    {
      query,
    },
    {
      headers: {
        'X-Web-Auth': process.env.SUNDAE_WEB_AUTH,
      },
    }
  );

  const { data, errors } = resp.data;
  console.log(JSON.stringify(resp.data));
  if (errors) {
    return {
      errors,
    };
  }
  const { createStripeCheckoutSession } = data;
  return {
    errors: null,
    sessionData: createStripeCheckoutSession,
  };
}

export default async (req, res) => {
  const resp = await createWorkshopSession(req.body);
  if (resp.errors) {
    res.send({
      errorMessage: resp.errors[0].message,
    });
  } else {
    res.send({
      data: resp,
    });
  }
};
