import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function getSeriesEpisodes(id, creatorId, sessionId) {
  const query = `query {
    episodes(first: 25,
      where: {
        seriesId: "${id}",
        creatorId: "${creatorId}"
    }) {
      edges {
        node {
          id
          title
          synopsis
          episodeNumber
          isDeleted
          isPublished
          isFree
          isEditable
          media {
            srcUrl
            previewUrl
          }
          pages {
            id
            content
          }
          creator {
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
  console.log(JSON.stringify(resp.data));
  if (errors) {
    return {
      errors,
      episodes: null
    };
  }
  const { episodes } = data;
  return {
    errors: null,
    episodes
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
    console.log(sessionId);
    const { id } = req.query;
    const resp = await getSeriesEpisodes(id,
      sundaeUser.creator.id,
      sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { episodes } = resp;
      if (!episodes) {
        res.send({
          errorMessage: 'No such episodes exists!'
        });
        return;
      }
      res.send({
        content: JSON.stringify(episodes)
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
