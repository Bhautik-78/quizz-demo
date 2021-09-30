import axios from 'axios';
import { getSession } from 'next-auth/client';

async function createWorkshop(workshopData, sessionId) {
  function _getImages(mediaUrls) {
    const imgs = mediaUrls.map((m) => `{
      srcUrl: "${m.srcUrl}",
      position: ${m.position},
      mediaType: ${m.mediaType}
    }`);

    return imgs.join(',');
  }
  const {
    title, topDescription,
    bottomDescription, isPublished,
    mediaUrls, price, isFree,
    welcomeEmail, welcomeEmailSubject
  } = workshopData;
  const mutation = `mutation {
    addWorkshop(input: {
      title: ${JSON.stringify(title)},
      topDescription: ${JSON.stringify(topDescription)},
      bottomDescription: ${JSON.stringify(bottomDescription)},
      isPublished: ${isPublished},
      isFree: ${isFree},
      welcomeEmail: ${JSON.stringify(welcomeEmail)},
      welcomeEmailSubject: ${JSON.stringify(welcomeEmailSubject)},
      price: "${price}",
      ${mediaUrls ? `mediaUrls: ${_getImages(mediaUrls)}` : ''}
    }) {
      id
      title
      price
      isFree
      isPublished
      handle
      welcomeEmail
      welcomeEmailSubject
      media {
        srcUrl
        previewUrl
      }
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
      workshop: null
    };
  }
  const { addWorkshop } = data;
  return {
    errors: null,
    workshop: addWorkshop
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await createWorkshop(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { workshop } = resp;
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
