import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function getEpisode(id, sessionId) {
  const query = `query {
    episode(id: "${id}") {
      id
      title
      style
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
        media{
          srcUrl
          previewUrl
        }
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
      episode: null
    };
  }
  const { episode } = data;
  return {
    errors: null,
    episode
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId, sundaeUser } = session.user;
    console.log(sessionId);
    const { id } = req.query;
    const resp = await getEpisode(id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { episode } = resp;
      console.log(resp);
      if (!episode) {
        res.send({
          errorMessage: 'No such episode exists!'
        });
        return;
      }
      if (episode.creator.id !== sundaeUser.creator.id) {
        res.send({
          errorMessage: 'You are not authorized to view this page'
        });
        return;
      }
      res.send({
        content: JSON.stringify(episode)
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
