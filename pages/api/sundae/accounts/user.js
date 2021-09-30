import axios from 'axios';
import { getSession } from 'next-auth/client';

export async function user(userId, sessionId) {
  const query = `query {
    user(id: "${userId}") {
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
  const { user } = data;
  return {
    errors: null,
    user
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId, sundaeUser } = session.user;
    const resp = await user(sundaeUser.id, sessionId);
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
