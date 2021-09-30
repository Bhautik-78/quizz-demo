import axios from 'axios';
import { getSession } from 'next-auth/client';

async function createEpisode(mutableData, sessionId) {
  console.log(mutableData, 'cs graphql');
  function _getImages(mediaUrls) {
    const imgs = mediaUrls.map((m) => `{
        srcUrl: "${m.srcUrl}",
        position: ${m.position},
        mediaType: ${m.mediaType}
      }`);

    return imgs.join(',');
  }
  const {
    seriesId, title, synopsis,
    isPublished, episodeNumber, isFree,
    episodeStyle, mediaUrls
  } = mutableData;
  const mutation = `mutation {
    createEpisode(input: {
      seriesId: "${seriesId}",
      style: ${episodeStyle || 'TEXT'},
      title: "${title}",
      synopsis: "${synopsis}",
      isPublished: ${isPublished},
      isDraft: false,
      isFree: ${isFree},
      episodeNumber: ${episodeNumber},
      ${mediaUrls ? `mediaUrls: ${_getImages(mediaUrls)}` : ''}
    }) {
      id
    }
  }`;
  console.log(mutation, 'mut');
  const resp = await axios.post(process.env.BACKEND_URL, {
    query: mutation
  }, {
    headers: {
      'X-Session': sessionId
    }
  });

  const { data, errors } = resp.data;
  if (errors) {
    console.log(errors);
    return {
      errors,
      episode: null
    };
  }
  const { createEpisode } = data;
  return {
    errors: null,
    episode: createEpisode
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    console.log(req.body, 'check on api side');
    const { sessionId } = session.user;
    const resp = await createEpisode(req.body, sessionId);
    if (resp.errors) {
      console.log(resp.errors);
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { episode } = resp;
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
