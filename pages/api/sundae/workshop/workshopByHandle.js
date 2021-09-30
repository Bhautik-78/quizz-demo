import axios from 'axios';

export async function getWorkshop(handle) {
  console.log(handle, 'here.......');
  const query = `query {
    getWorkshopByHandle(handle: "${handle}") {
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
        sessions {
          title
          description
        }
    }   
  }`;
  const resp = await axios.post(process.env.BACKEND_URL, {
    query
  });

  const { data, errors } = resp.data;
  console.log(JSON.stringify(resp.data));
  if (errors) {
    return {
      errors,
      workshop: null
    };
  }
  const { getWorkshopByHandle } = data;
  console.log(getWorkshopByHandle, 'yeh..........');
  return {
    errors: null,
    workshop:getWorkshopByHandle
  };
}

export default async (req, res) => {
  const { handle } = req.body;
  console.log(handle);
  const resp = await getWorkshop(handle);
  if (resp.errors) {
    res.send({
      errorMessage: resp.errors[0].message
    });
  } else {
    const { workshop } = resp;
    console.log(resp);
    if (!workshop) {
      res.send({
        errorMessage: 'No such workshop exists!'
      });
      return;
    }
    res.send({
      workshop
    });
  }
};
