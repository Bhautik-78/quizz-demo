import axios from 'axios';
import { getSession } from 'next-auth/client';

async function createPage(mutableData, sessionId) {
  function _getImages(mediaUrls) {
    const imgs = mediaUrls.map((m) => `{
        srcUrl: "${m.srcUrl}",
        position: ${m.position},
        mediaType: ${m.mediaType}
      }`);

    return imgs.join(',');
  }
  const {
    episodeId, pageNumber,
    content, mediaUrls
  } = mutableData;
  const mutation = `mutation {
    createPage(input: {
      episodeId: "${episodeId}",
      pageNumber: ${pageNumber},
      content: ${JSON.stringify(content)},
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
  console.log(resp.data);
  const { data, errors } = resp.data;
  if (errors) {
    return {
      errors,
      page: null
    };
  }
  const { createPage } = data;
  return {
    errors: null,
    page: createPage
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    console.log(req.body);
    const { sessionId } = session.user;
    const resp = await createPage(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { page } = resp;
      res.send({
        content: JSON.stringify(page)
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
