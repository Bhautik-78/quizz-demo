import axios from 'axios';
import { getSession } from 'next-auth/client';

async function updateEpisode(id, mutableData, sessionId) {
  function _getImages(mediaUrls) {
    const imgs = mediaUrls.map((m) => `{
        srcUrl: "${m.srcUrl}",
        position: ${m.position},
        mediaType: ${m.mediaType}
      }`);

    return imgs.join(',');
  }
  const {
    title, synopsis,
    isPublished, episodeNumber, seriesId,
    isFree, mediaUrls
  } = mutableData;
  const mutation = `mutation {
    updateEpisode(input: {
      id: "${id}",
      seriesId: "${seriesId}",
      title: "${title}",
      synopsis: "${synopsis}",
      isPublished: ${isPublished},
      isFree: ${isFree},
      episodeNumber: ${episodeNumber},
      ${mediaUrls ? `mediaUrls: ${_getImages(mediaUrls)}` : ''}
    }) {
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
    console.log(JSON.stringify(errors), 'err_10');
    return {
      errors,
      episode: null
    };
  }
  const { updateEpisode } = data;
  return {
    errors: null,
    episode: updateEpisode
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    console.log(req.body);
    const { sessionId } = session.user;
    const resp = await updateEpisode(req.body.id, req.body, sessionId);
    if (resp.errors) {
      console.log(JSON.stringify(resp), 'err');
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
