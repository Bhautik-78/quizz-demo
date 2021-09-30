import axios from 'axios';

async function addCreatorWaitlister(waitlistData) {
  const {
    email, firstName, lastName,
    offeringType, creatorId
  } = waitlistData;
  let { offeringId } = waitlistData;
  if (offeringType === 'SUBSCRIPTION') {
    offeringId = creatorId;
  }
  const mutation = `mutation {
    addWaitlister(input: {
      creatorId: "${creatorId}",
      email: "${email}",
      ${firstName ? `firstName: "${firstName}"` : ''}
      ${lastName ? `lastName: "${lastName}"` : ''}
      offeringType: ${offeringType}
      ${offeringId ? `offeringId: "${offeringId}"` : ''}
    }) {
      id
    }
  }`;
  const resp = await axios.post(process.env.BACKEND_URL, {
    query: mutation
  }, {
    headers: {
      'X-Web-Auth': process.env.SUNDAE_WEB_AUTH
    }
  });

  const { data, errors } = resp.data;
  if (errors) {
    return {
      errors,
      waitlister: null
    };
  }
  const { addWaitlister } = data;
  return {
    errors: null,
    waitlister: addWaitlister
  };
}

export default async (req, res) => {
  const resp = await addCreatorWaitlister(req.body);
  if (resp.errors) {
    res.send({
      errorMessage: resp.errors[0].message
    });
  } else {
    const {
      waitlister
    } = resp;
    res.send({
      waitlister
    });
  }
};
