import axios from 'axios';

async function getCreatorByHandle(handle) {
  const query = `query {
    creatorByHandle(handle: "${handle}") {
      id
      creatorTitle
      creatorDescription
      imageUrl
      landscape_imageUrl
      workshopLandingPageData
      user {
        id
        firstName
        lastName
        imageUrl
        handle
      }
    }   
  }`;
  const resp = await axios.post(process.env.BACKEND_URL, {
      query
  });
  const { data } = resp.data;
  const { creatorByHandle } = data;
  return creatorByHandle;
}

export default async (req, res) => {
  const { handle } = req.body;
  const resp = await getCreatorByHandle(handle);
  res.send({
    creator: resp
  });
}