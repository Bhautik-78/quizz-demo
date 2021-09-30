import axios from 'axios';

async function buyWorkshopForFree(id, inputData) {
  const {
    email, firstName, lastName
  } = inputData;
  const query = `mutation {
    buyFreeWorkshop(input:{
        workshopId: "${id}",
        firstName: "${firstName}",
        lastName:"${lastName}",
        email: "${email}"
    }) {
      id
    }
  }`;
  const resp = await axios.post(
    process.env.BACKEND_URL,
    {
      query,
    }, {
      headers: {
        'X-Web-Auth': process.env.SUNDAE_WEB_AUTH
      }
    }
  );

  const { data, errors } = resp.data;
  console.log(JSON.stringify(resp.data));
  if (errors) {
    return {
      errors,
      buyer: null
    };
  }
  const { buyFreeWorkshop } = data;
  return {
    errors: null,
    buyer: buyFreeWorkshop,
  };
}

export default async (req, res) => {
  const { id } = req.query;
  const resp = await buyWorkshopForFree(id, req.body);
  if (resp.errors) {
    res.send({
      errorMessage: resp.errors[0].message,
    });
  } else {
    res.send({
      buyer: resp.buyer,
    });
  }
};
