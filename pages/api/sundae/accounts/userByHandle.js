import axios from 'axios';
import { getSession } from 'next-auth/client';

async function userByHandle(handle, sessionId) {
  const query = `query {
    userByHandle(handle: "${handle}") {
      id
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
  const { userByHandle } = data;
  return {
    errors: null,
    user: userByHandle
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;
    const resp = await userByHandle(req.body.handle, sessionId);
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
