import axios from 'axios';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Alert, Container, CustomInput } from 'reactstrap';
import Layout from '../../Components/Layout/Layout';
import NotificationRedirectObject from '../../Components/NotificationRedirectObject/NotificationRedirectObject';

import styles from './index.module.scss';

const SendNotification = () => {
  const router = useRouter();
  const [session, loading] = useSession();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isTest, setIsTest] = useState(true);
  const [serverErr, setServerErr] = useState(null);
  const [success, setSuccess] = useState(null);
  const [redirectObj, setRedirectObj] = useState(null);

  const [isLoading, setLoading] = useState(false);

  const [clientErr, setClientErr] = useState({
    title: '',
    body: ''
  });

  const setInitialErrors = () => {
    setClientErr({
      title: '',
      body: ''
    });
  };

  const doSetInitialState = () => {
    setTitle('');
    setBody('');
    setIsTest(true);
    setServerErr(null);
    setRedirectObj(null);
  };

  const doSendNotification = async () => {
    setServerErr(null);
    setSuccess(null);
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!title.trim()) {
      errorsCopy.title = 'Notification Title is Required';
      isError = true;
    }

    if (!body.trim()) {
      errorsCopy.body = 'Notification Body is Required';
      isError = true;
    }
    console.log('test');
    if (isError) {
      console.log('err');
      setClientErr({ ...errorsCopy });
    } else {
      setLoading(true);
      try {
        const data = {
          body,
          title,
          isTest
        };
        console.log(redirectObj);
        if (redirectObj) {
          if (redirectObj.type === 'SERIES') {
            data.seriesId = redirectObj.id;
          } else {
            data.episodeId = redirectObj.id;
          }
        }
        const resp = await axios.post('/api/sundae/notifications/sendNotification', data);
        console.log(resp);
        if (resp.data.errorMessage) {
          setServerErr(resp.data.errorMessage);
        } else if (isTest) {
          setSuccess('Test Notification sent! Check your phone');
        } else {
          setSuccess('Notification sent to your subscribers!');
          doSetInitialState();
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
        setServerErr('Something went wrong');
      }
    }
  };

  if (loading) return null;
  if (!loading && !session) {
    router.push('/');
  }

  return (
    <Layout>
      <Head>
        <title>Sundae - Push Notifications</title>
      </Head>
      <div className={styles.notifications_container}>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : '' }
        {success ? <Alert color="success">{success}</Alert> : ''}
        <Container>
          <h1>Send a Notification to Subscribers</h1>
          <hr />
          <div className={styles.send_notification_container}>
            <div className="form-input-container">
              <label>Notification Title</label>
              <input
                type="text"
                placeholder="Hello subscriber"
                value={title}
                onChange={(e) => {
                  setInitialErrors();
                  setTitle(e.target.value);
                }}
              />
              <small className="text-danger pl-2">
                {clientErr.title ? clientErr.title : ''}
              </small>
            </div>
            <div className="form-input-container">
              <label>Notification Body</label>
              <textarea
                rows="2"
                maxLength="255"
                placeholder="Enter notification body"
                value={body}
                onChange={(e) => {
                  setInitialErrors();
                  setBody(e.target.value);
                }}
              />
              <small className="text-danger pl-2">
                {clientErr.body ? clientErr.body : ''}
              </small>
            </div>
            <div className="form-input-container">
              <CustomInput
                type="switch"
                id="isTest"
                name="isTestSwitch"
                label="Test"
                value={isTest}
                checked={isTest ? 'checked' : ''}
                onChange={(e) => {
                  setInitialErrors();
                  console.log(e.target.value);
                  setIsTest(!isTest);
                }}
              />
            </div>
            <NotificationRedirectObject
              callback={setRedirectObj}
              curRedirectObj={redirectObj}
            />
            <div className={styles.btn_container}>
              <button
                type="button"
                onClick={doSendNotification}
                disabled={isLoading ? 'disabled' : ''}
                className="btn btn-dark btn-block"
              >
                {isLoading ? 'Loading...' : `Send ${isTest ? 'test ' : ' '}Notification${isTest ? ' to me' : ''}`}
              </button>
            </div>
          </div>
        </Container>
      </div>
    </Layout>
  );
};

export default SendNotification;
