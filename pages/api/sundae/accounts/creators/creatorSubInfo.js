import axios from 'axios';

export async function creatorSubscriptionInfo(id) {
  const query = `query {
    creatorSubscriptionInfo(id: "${id}")
  }`;
  const resp = await axios.post(process.env.BACKEND_URL, {
    query
  });

  const { data, errors } = resp.data;
  console.log(JSON.stringify(resp.data));
  if (errors) {
    return {
      errors,
      creatorSubscriptionInfo: null
    };
  }
  const { creatorSubscriptionInfo } = data;
  return {
    errors: null,
    creatorSubscriptionInfo
  }
}

export default async (req, res) => {

  const { id } = req.body; 
  const resp = await creatorSubscriptionInfo(id);
  if (resp.errors) {
    res.send({
      errorMessage: resp.errors[0].message
    });
  } else {
    const { creatorSubscriptionInfo } = resp;
    console.log(resp);
    res.send({
      creatorSubscriptionInfo
    });
  }
}