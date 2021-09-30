import axios from 'axios';
import { getSession } from 'next-auth/client';

async function completeMultiPartUpload(mediaData, sessionId) {
  console.log(mediaData);
  const { key, parts, uploadId } = mediaData;
  const query = `query {
    completeMultiPartUpload(input: {
      key: "${key}",
      uploadId: "${uploadId}",
      parts: ${JSON.stringify(JSON.stringify(parts))}
    }) {
      finalUrl
    }
  }`;
  console.log(query);
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
      finalUrl: null
    };
  }
  const { completeMultiPartUpload } = data;
  const { finalUrl } = completeMultiPartUpload;
  return {
    errors: null,
    finalUrl
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await completeMultiPartUpload(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { finalUrl } = resp;
      res.send({
        finalUrl
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
