import axios from 'axios';
import { getSession } from 'next-auth/client';

async function deleteSeries(id, sessionId) {
  const mutation = `mutation {
    deleteSeries(id: "${id}") {
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

  const { data, errors } = resp.data;
  if (errors) {
    return {
      errors,
      series: null
    };
  }
  const { deleteSeries } = data;
  return {
    errors: null,
    series: deleteSeries
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { id } = req.query;
    const resp = await deleteSeries(id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { series } = resp;
      res.send({
        series
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
}