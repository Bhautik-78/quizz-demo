import axios from 'axios';
import { getSession } from 'next-auth/client';

async function getWorkshopUsers(sessionId) {
  const query = `query {
    workshopUsers {
      id
      stripeCustomer
      purchaseType
      user {
        id
        email
        firstName
        lastName
      }
      workshop {
        id
        title
        price
      }
      createdAt
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
      workshopUsers: null
    };
  }

  const { workshopUsers } = data;
  return {
    errors: null,
    workshopUsers
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId } = session.user;

    const resp = await getWorkshopUsers(sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { workshopUsers } = resp;
      res.send({
        workshopUsers
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
