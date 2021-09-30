import axios from 'axios';
import { getSession } from 'next-auth/client';

async function updateSeries(id, mutableData, sessionId) {
  function _getImages(mediaUrls) {
    const imgs = mediaUrls.map((m) => `{
        srcUrl: "${m.srcUrl}",
        position: ${m.position},
        mediaType: ${m.mediaType}
      }`);

    return imgs.join(',');
  }
  const {
    title, shortDescription,
    isPublished, mediaUrls
  } = mutableData;
  const mutation = `mutation {
    updateSeries(input: {
      id: "${id}",
      ${title ? `title: "${title}",` : ''}
      ${shortDescription ? `shortDescription: "${shortDescription}",` : ''}
      ${isPublished !== undefined ? `isPublished: ${isPublished},` : ''}
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
    return {
      errors,
      series: null
    };
  }
  const { updateSeries } = data;
  return {
    errors: null,
    series: updateSeries
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    console.log(req.body);
    const { sessionId } = session.user;
    const resp = await updateSeries(req.body.id, req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { series } = resp;
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
