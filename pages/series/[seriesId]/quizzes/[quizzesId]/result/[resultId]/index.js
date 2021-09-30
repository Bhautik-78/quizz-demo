import React, { useState } from 'react';
import Head from 'next/dist/next-server/lib/head';
import Layout from '../../../../../../../Components/Layout/Layout';
import ResultCard from '../../../../../../../Components/ResultCard';

const ResultId = () => {
  const [flag, setFlag] = useState(false);

  return (
    <Layout quizNav flag={flag}>
      <Head>
        <title>Sundae - Result</title>
      </Head>
      <div>
        <ResultCard setFlag={setFlag} flag={flag} />
      </div>
    </Layout>
  );
};

export default ResultId;
