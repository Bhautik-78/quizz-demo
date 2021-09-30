import axios from 'axios';
import { getSession } from 'next-auth/client';

async function getCreatorWorkshops(creatorId, sessionId) {
  const query = `query {
    getCreatorWorkshops(creatorId: "${creatorId}",
                        returnAll: true) {
                          id
                          title
                          handle
                          price
                          topDescription
                          bottomDescription
                          isPublished
                          isFree
                          webpageData
                          welcomeEmail
                          welcomeEmailSubject
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
  if (errors) {
    return {
      errors,
      workshops: null
    };
  }

  const { getCreatorWorkshops } = data;
  return {
    errors: null,
    workshops: getCreatorWorkshops
  };
}

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const { sessionId, sundaeUser } = session.user;
    if (!sundaeUser.creator) {
      res.send({
        erroMessage: 'You are not a creator, only creators can access this page'
      });
    }
    const resp = await getCreatorWorkshops(sundaeUser.creator.id, sessionId);
    if (resp.errors) {
      res.send({
        errorMessage: resp.errors[0].message
      });
    } else {
      const { workshops } = resp;
      res.send({
        workshops
      });
    }
  } else {
    res.send({
      errorMessage: 'You need to be signed in'
    });
  }
};
