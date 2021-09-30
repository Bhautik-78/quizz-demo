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

const Payments = () => {
  const router = useRouter();
  const [session, loading] = useSession();
  const [stpConnAcc, setStpConnAcc] = useState(null);
  const [serverErr, setServerErr] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    const getOrCreateAccount = async () => {
      setIsLoading(true);
      const response = await axios.get('/api/sundae/payments/getAccount');
      if (response.data.errorMessage) {
        setServerErr(response.data.errorMessage);
      } else if (response.data.account) {
        setStpConnAcc(response.data.account);
      } else {
        const createResp = await axios.post('/api/sundae/payments/createAccount', {});
        if (createResp.data.errorMessage) {
          setServerErr(createResp.data.errorMessage);
        } else {
          setStpConnAcc(response.data.account);
        }
      }
      setIsLoading(false);
    };
    getOrCreateAccount();
  }, [session]);

  useEffect(() => {
    if (stpConnAcc) {
      if (!stpConnAcc.details_submitted
          || !stpConnAcc.charges_enabled) {
        setRedirectUrl('/payments/refresh');
      } else {
        const getLoginLink = async () => {
          setIsLoading(true);
          const linkResp =  await axios.get('/api/sundae/payments/getLoginLink');
          if (linkResp.data.errorMessage) {
            setServerErr(linkResp.data.errorMessage);
          } else {
            setRedirectUrl(linkResp.data.loginLink.url);
          }
          setIsLoading(false);
        };
        getLoginLink();
      }
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
        You will be redirected to Stripe Connect Dashboard momentarily!
        <br />
        {isLoading ? <Spinner /> : ''}
      </Container>
    </Layout>
  );
};

export default Payments;
