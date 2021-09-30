import axios from 'axios';
import { getSession } from 'next-auth/client';

async function getPresignedUrl(mediaData, sessionId) {
  console.log(mediaData);
  const { mediaType, fileType } = mediaData;
  const query = `query {
    presignedUrl(input: {
      type: ${mediaType},
      fileType: ${fileType}
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
  const { presignedUrl } = data;
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
        content: JSON.stringify(presignedUrl)
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
