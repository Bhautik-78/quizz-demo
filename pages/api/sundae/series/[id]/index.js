import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function getSeries(id, sessionId) {
  const query = `query {
    series(id: "${id}") {
      id
      title
      isPublished
      shortDescription
      media {
        srcUrl
        previewUrl
      }
      episodes {
        id
      }
      creator {
        id
      }
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
  console.log(JSON.stringify(resp.data));
  if (errors) {
    return {
      errors,
      series: null
    };
  }
  const { series } = data;
  return {
    errors: null,
    series
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId, sundaeUser } = session.user;
    console.log(sessionId);
    const { id } = req.query;
    const resp = await getSeries(id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { series } = resp;
      console.log(resp);
      if (!series) {
        res.send({
          errorMessage: 'No such series exists!'
        });
        return;
      }
      if (series.creator.id !== sundaeUser.creator.id) {
        res.send({
          errorMessage: 'You are not authorized to view this page'
        });
        return;
      }
      res.send({
        content: JSON.stringify(series)
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
