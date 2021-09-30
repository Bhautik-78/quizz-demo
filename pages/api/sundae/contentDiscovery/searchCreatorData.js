import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function searchCreatorData(searchQuery, sessionId) {
  const query = `query {
    searchCreatorData(query: "${searchQuery}") {
      episodes {
        id
        title
        media {
          srcUrl
        }
      }
      series {
        id
        title
        media {
          srcUrl
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
      episodes: null,
      series: null
    };
  }
  const { series, episodes } = data.searchCreatorData;
  return {
    errors: null,
    episodes,
    series
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const { query } = req.body;
    const resp = await searchCreatorData(query, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { episodes, series } = resp;
      res.send({
        episodes,
        series
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
