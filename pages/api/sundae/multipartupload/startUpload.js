import axios from 'axios';
import { getSession } from 'next-auth/client';

async function startUpload(mediaData, sessionId) {
  console.log(mediaData);
  const { mediaType, fileType } = mediaData;
  const query = `query {
    startMultiPartUpload(input: {
      type: ${mediaType},
      fileType: ${fileType}
    }) {
      uploadId
      key
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
      uploadId: null,
      key: null
    };
  }
  const { startMultiPartUpload } = data;
  const { uploadId, key } = startMultiPartUpload;
  return {
    errors: null,
    uploadId,
    key
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await startUpload(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { uploadId, key } = resp;
      res.send({
        uploadId,
        key
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
