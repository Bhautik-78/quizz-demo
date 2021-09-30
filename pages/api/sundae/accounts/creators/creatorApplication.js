/* eslint-disable camelcase */
import axios from 'axios';
import { getSession } from 'next-auth/client';

async function creatorApplication(creatorData, sessionId) {
  const {
    creatorDescription,
    creatorTitle,
    creatorTagline,
    imageUrl,
    landscape_imageUrl,
    price
  } = creatorData;

  const mutation = `mutation {
    creatorApplication(input: {
      creatorDescription: ${JSON.stringify(creatorDescription)},
      creatorTitle: "${creatorTitle}",
      creatorTagline: ${JSON.stringify(creatorTagline)},
      imageUrl: "${imageUrl}",
      landscape_imageUrl: "${landscape_imageUrl}",
      price: "${price}"
    })
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
      created: false
    };
  }
  const { creatorApplication } = data;
  return {
    errors: null,
    created: creatorApplication
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await creatorApplication(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { created } = resp;
      res.send({
        created
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
