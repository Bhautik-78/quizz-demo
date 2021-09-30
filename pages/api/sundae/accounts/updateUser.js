import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function updateUser(userData, sessionId) {
  const {
    firstName, lastName, email,
    imageUrl, handle
  } = userData;
  const query = `mutation {
    updateUser(input: {
      ${firstName ? `firstName: "${firstName}",` : ''}
      ${lastName ? `lastName: "${lastName}",` : ''}
      ${email ? `email: "${email}",` : ''}
      ${imageUrl ? `imageUrl: "${imageUrl}",` : ''}
      ${handle ? `handle: "${handle}"` : ''}
    }) {
      id
      firstName
      lastName
      email
      imageUrl
      handle
      creator {
        id
      }
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
      user: null
    };
  }
  const { updateUser } = data;
  return {
    errors: null,
    user: updateUser
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await updateUser(req.body, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { user } = resp;
      res.send({
        user
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
