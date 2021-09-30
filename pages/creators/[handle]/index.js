import Error from 'next/error';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Layout from '../../../Components/Layout/Layout';
import Footer from '../../../Components/Footer/Footer';
import CreatorSubscribe from '../../../Components/CreatorSubscribe/CreatorSubscribe';
import styles from '../../../styles/subs.module.scss';

// export default function CreatorPage({ creator, error }) {
export default function CreatorPage({ handle }) {
  const [isLoading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    const getCreatorByHandle = async () => {
      const response = await axios.post(
        '/api/sundae/accounts/creators/creatorByHandle',
        {
          handle
        }
      );
      setCreator(response.data.creator);
      setLoading(false);
    };
    getCreatorByHandle();
  }, [handle]);

  if (isLoading) return null;
  if (!creator) {
    return <Error statusCode={404} />;
  }

  return (
    <Layout isHide>
      <Head>
        <title>
          Sundae -
          {' '}
          {creator.creatorTitle}
        </title>
      </Head>
      <main className={styles.subs_container}>
        <CreatorSubscribe creator={creator} handle={handle} />
        <Footer />
      </main>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  return {
    props: {
      ...params,
    }
  };
}
