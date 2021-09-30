import axios from 'axios';
import { getSession } from 'next-auth/client';

async function updateWorkshop(workshopData, sessionId) {
  function _getImages(mediaUrls) {
    const imgs = mediaUrls.map(
      (m) => `{
      srcUrl: "${m.srcUrl}",
      position: ${m.position},
      mediaType: ${m.mediaType}
    }`
    );
    return imgs.join(',');
  }
  const {
    id,
    title,
    topDescription,
    bottomDescription,
    isPublished,
    mediaUrls,
    price,
    isFree,
    webpageData,
    welcomeEmail, welcomeEmailSubject
  } = workshopData;
  const mutation = `mutation {
    updateWorkshop(input: {
      id: "${id}",
      title: ${JSON.stringify(title)},
      topDescription: ${JSON.stringify(topDescription)},
      bottomDescription: ${JSON.stringify(bottomDescription)},
      webpageData:${JSON.stringify(webpageData)},
      isPublished: ${isPublished},
      isFree: ${isFree},
      price: "${price}",
      welcomeEmail: ${JSON.stringify(welcomeEmail)},
      welcomeEmailSubject: ${JSON.stringify(welcomeEmailSubject)},
      ${mediaUrls ? `mediaUrls: ${_getImages(mediaUrls)}` : ''}
    }) {
      id
      title
      price
      isPublished
      isFree
      handle
      welcomeEmail
      welcomeEmailSubject
      media {
        srcUrl
        previewUrl
      }
    }
  }`;
  const resp = await axios.post(
    process.env.BACKEND_URL,
    {
      query: mutation,
    },
    {
      headers: {
        'X-Session': sessionId,
      },
    }
  );
  const { data, errors } = resp.data;
  if (errors) {
    return {
      errors,
      workshop: null,
    };
  }
  const { updateWorkshop } = data;
  return {
    errors: null,
    workshop: updateWorkshop,
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await updateWorkshop(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message,
      });
    } else {
      const { workshop } = resp;
      res.send({
        workshop,
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in',
    });
  }
};
