import axios from 'axios';
import { getSession } from 'next-auth/client';

async function getCreatorWorkshopsByHandle(handle) {
  const query = `query {
    getCreatorWorkshopsByHandle(handle: "${handle}") {
                          id
                          title
                          handle
                          price
                          topDescription
                          bottomDescription
                          isPublished
                          welcomeEmail
                          welcomeEmailSubject
                          media {
                            srcUrl
                            previewUrl
                          }
                          createdAt
                          updatedAt
                          sessions {
                            title
                            description
                          }
                        }
  }`;
  const resp = await axios.post(
    process.env.BACKEND_URL,
    {
      query,
    }
  );
  const { data, errors } = resp.data;
  if (errors) {
    return {
      errors,
      workshops: null,
    };
  }

  const { getCreatorWorkshopsByHandle } = data;
  return {
    errors: null,
    workshops: getCreatorWorkshopsByHandle,
  };
}

export default async (req, res) => {
  const { handle } = req.query;
  const resp = await getCreatorWorkshopsByHandle(
    handle
  );
  if (resp.errors) {
    res.send({
      errorMessage: resp.errors[0].message,
    });
  } else {
    const { workshops } = resp;
    res.send({
      workshops,
    });
  }
};
