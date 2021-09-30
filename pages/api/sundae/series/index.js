import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function getAllCreatorSeries(creatorId, sessionId, args = { first: 50, after: null }) {
  const { first, after } = args;
  const query = `query {
    allCreatorSeries(creatorId: "${creatorId}",
                     first: ${first},
                     ${after ? `after: "${after}"` : ''},
                     where: {}) {
      edges {
        node {
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
          createdAt
          updatedAt
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
      allCreatorSeries: null
    };
  }
  const { allCreatorSeries } = data;
  return {
    errors: null,
    allCreatorSeries
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId, sundaeUser } = session.user;
    if (!sundaeUser.creator) {
      res.send({
        errorMessage: 'You are not a creator, only creators can access this page'
      });
    }
    const resp = await getAllCreatorSeries(sundaeUser.creator.id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      res.send({
        content: JSON.stringify(resp.allCreatorSeries)
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
