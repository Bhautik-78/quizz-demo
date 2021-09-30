import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import React from 'react';
import { Container } from 'reactstrap';
import Layout from '../../Components/Layout/Layout';
import UserSettings from '../../Components/UserSettings/UserSettings';
import CreatorSettings from '../../Components/CreatorSettings/CreatorSettings';
import Head from 'next/head';

const Settings = () => {
  const router = useRouter();
  const [session, loading] = useSession();

  if (loading) return null;
  if (!loading && !session) {
    router.push('/');
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Sundae - Settings</title>
      </Head>
      <Container>
        <UserSettings sundaeUser={session.user.sundaeUser} />
        <hr />
        <CreatorSettings sundaeUser={session.user.sundaeUser} />
      </Container>
    </Layout>
  );
};

export default Settings;
