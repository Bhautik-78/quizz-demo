import React, { useEffect, useState } from 'react';
import Error from 'next/error';
import { useRouter } from 'next/router';
import axios from 'axios';

const Landing = ({ handle }) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [serverErr, setServerErr] = useState();
  const [workshopsData, setWorkshopsData] = useState(null);

  useEffect(() => {
    const getCreatorWorkshops = async () => {
      try {
        setLoading(true);
        const resp = await axios.get(`/api/sundae/workshop/creator/${handle}`);
        console.log(resp.data, 'finally..................');
        if (resp.data.errorMessage) {
          setServerErr(resp.data.errorMessage);
        } else {
          setWorkshopsData(resp.data.workshops);
        }
      } catch (e) {
        setServerErr(e.toString());
      } finally {
        setLoading(false);
      }
    };
    getCreatorWorkshops();
  }, [handle]);

  if (serverErr) {
    return <Error statusCode={404} />;
  }
  if (!isLoading) {
    if (workshopsData) {
      if (workshopsData.length < 1) {
        return <Error statusCode={404} />;
      }
      router.push(
        `https://${window.location.hostname}/creators/${handle}/workshops/${workshopsData[0].handle}`
      );
    }
  }
console.log()
  return null;
};

export async function getServerSideProps({ params }) {
  return {
    props: {
      ...params,
    },
  };
}

export default Landing;
