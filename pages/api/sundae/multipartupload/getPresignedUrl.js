import axios from 'axios';
import { getSession } from 'next-auth/client';

async function getPresignedUrl(mediaData, sessionId) {
  console.log(mediaData);
  const { key, partNumber, uploadId } = mediaData;
  const query = `query {
    getMultiPartPresignedUrl(input: {
      key: "${key}",
      partNumber: ${partNumber},
      uploadId: "${uploadId}"
    }) {
      newUrl
      presignedUrl
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
      presignedUrl: null
    };
  }
  console.log(data);
  const { getMultiPartPresignedUrl } = data;
  const { presignedUrl } = getMultiPartPresignedUrl;
  return {
    errors: null,
    presignedUrl
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await getPresignedUrl(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { presignedUrl } = resp;
      res.send({
        presignedUrl
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
