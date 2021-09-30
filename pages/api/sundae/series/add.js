import axios from 'axios';
import { getSession } from 'next-auth/client';

async function createSeries(mutableData, sessionId) {
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
    createSeries(input: {
      title: "${title}",
      shortDescription: "${shortDescription}",
      isPublished: ${isPublished},
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
  const { createSeries } = data;
  return {
    errors: null,
    series: createSeries
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    console.log(req.body);
    const { sessionId } = session.user;
    const resp = await createSeries(req.body, sessionId);
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
