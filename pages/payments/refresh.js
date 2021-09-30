import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/client';
import {
  Container,
  Alert,
  Spinner
} from 'reactstrap';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../../Components/Layout/Layout';

const Refresh = () => {
  const router = useRouter();
  const [session, loading] = useSession();
  const [stpConnAcc, setStpConnAcc] = useState(null);
  const [serverErr, setServerErr] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    const getAccount = async () => {
      setIsLoading(true);
      const response = await axios.get('/api/sundae/payments/getAccount');
      if (response.data.errorMessage) {
        setServerErr(response.data.errorMessage);
      } else if (response.data.account) {
        setStpConnAcc(response.data.account);
      } else {
        setRedirectUrl('/payments');
      }
      setIsLoading(true);
    };
    getAccount();
  }, [session]);

  useEffect(() => {
    if (stpConnAcc) {
      const getAccountLink = async () => {
        const resp = await axios.post('/api/sundae/payments/getAccountLink', {
          accountId: stpConnAcc.id
        });
        if (resp.data.errorMessage) {
          setServerErr(resp.data.errorMessage);
        } else {
          setRedirectUrl(resp.data.accountLink.url);
        }
      };
      getAccountLink();
    }
  }, [stpConnAcc]);

  if (loading) return '';

  if (!loading && !session) {
    router.push('/');
  }

  if (session && session.user && !session.user.sundaeUser.creator) {
    router.push('/');
  }

  if (redirectUrl) {
    router.push(redirectUrl);
  }

  return (
    <Layout>
      {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
      <Container>
        You need to finish connecting your banking information with your account.
        <br />
        Please wait while we redirect you...
        <br />
        {isLoading ? <Spinner /> : ''}
      </Container>
    </Layout>
  );
};

export default Refresh;
