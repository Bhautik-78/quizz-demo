import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function getWorkshop(id, sessionId) {
  const query = `query {
    workshop(id: "${id}") {
      id
      title
      handle
      price
      topDescription
      bottomDescription
      webpageData
      isPublished
      welcomeEmail
      welcomeEmailSubject
      isFree
      media {
        srcUrl
        previewUrl
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
      workshop: null
    };
  }
  const { workshop } = data;
  return {
    errors: null,
    workshop
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId, sundaeUser } = session.user;
    console.log(sessionId);
    const { id } = req.query;
    const resp = await getWorkshop(id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { workshop } = resp;
      console.log(resp);
      if (!workshop) {
        res.send({
          errorMessage: 'No such workshop exists!'
        });
        return;
      }
      res.send({
        workshop
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
