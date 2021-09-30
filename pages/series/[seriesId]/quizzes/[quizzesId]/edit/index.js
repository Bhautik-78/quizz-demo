import React from 'react';
import Head from 'next/dist/next-server/lib/head';
import Layout from '../../../../../../Components/Layout/Layout';
import EditQuizzes from '../../../../../../Components/EditQuizzes';

const Edit = () => (
  <Layout quizNav>
    <Head>
      <title>Sundae - Edit</title>
    </Head>
    <div>
      <EditQuizzes />
    </div>
  </Layout>
);

export default Edit;
