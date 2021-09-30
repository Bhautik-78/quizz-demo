import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import {
  Container,
  Row,
  Col,
  Alert,
  Table,
  Spinner,
  Button
} from 'reactstrap';
import axios from 'axios';
import Layout from '../../Components/Layout/Layout';
import styles from './subscriptions.module.scss';
import Head from 'next/head';

const Subscriptions = () => {
  const router = useRouter();
  const [session, loading] = useSession();
  const [subscriptions, setSubscriptions] = useState(null);
  const [customerPortalLink, setPortalLink] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);

  useEffect(() => {
    if (session) {
      const getSubsAndLink = async () => {
        try {
          setLoading(true);
          const resp = await axios.get('/api/sundae/payments/getUserSubscriptions');
          if (resp.data.errorMessage) {
            setServerErr(resp.data.errorMessage);
          } else {
            const { userSubscriptions } = resp.data;
            setSubscriptions(userSubscriptions.edges.map((edge) => {
              const { node } = edge;
              const expiresOn = new Date(node.expiresOn);
              delete node.expiresOn;
              let status = false;
              const now = new Date();
              if (now < expiresOn) {
                status = true;
              }
              return {
                ...node,
                expiresOn,
                status
              };
            }));
          }

          const respLink = await axios.get('/api/sundae/payments/getCustomerPortalLink');
          if (respLink.data.errorMessage) {
            setServerErr(respLink.data.errorMessage);
          } else {
            setPortalLink(respLink.data.link);
          }
        } catch (e) {
          setServerErr(e.toString());
        } finally {
          setLoading(false);
        }
      };
      getSubsAndLink();
    }
  }, [session]);

  if (loading) return null;

  if (!loading && !session) {
    router.push('/');
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Sundae - My Subscriptions</title>
      </Head>
      <div className={styles.subscriptions_container}>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        <Container>
          <h1>My Subscriptions</h1>
          <hr />
          {/* <div className={styles.top_stats_container}>
            <Row>
              <Col sm={12} md={3}>
                <div className={styles.stats_item}>
                  <div className={styles.img_container}>
                    <img src='/Assets/stats_1.png' />
                  </div>
                  <div className={styles.title_container}>
                    <p>Total Users</p>
                    <small style={{visibility:"hidden"}}>.</small>
                  </div>
                  <div className={styles.footer_no}>
                    <h1>12</h1>
                  </div>
                </div>
              </Col>
              <Col sm={12} md={3}>
                <div className={styles.stats_item}>
                  <div className={styles.img_container}>
                    <img src='/Assets/stats_2.png' />
                  </div>
                  <div className={styles.title_container}>
                    <p>Active Subscriptions</p>
                    <small>Including Free Trials</small>
                  </div>
                  <div className={styles.footer_no}>
                    <h1>15</h1>
                  </div>
                </div>
              </Col>
              <Col sm={12} md={3}>
                <div className={styles.stats_item}>
                  <div className={styles.img_container}>
                    <img src='/Assets/stats_3.png' />
                  </div>
                  <div className={styles.title_container}>
                    <p>Active Users</p>
                    <small>Last 30 Days</small>
                  </div>
                  <div className={styles.footer_no}>
                    <h1>9</h1>
                  </div>
                </div>
              </Col>
              <Col sm={12} md={3}>
                <div className={styles.stats_item}>
                  <div className={styles.img_container}>
                    <img src='/Assets/stats_4.png' />
                  </div>
                  <div className={styles.title_container}>
                    <p>Total Revenue</p>
                    <small>Year To Date</small>
                  </div>
                  <div className={styles.footer_no}>
                    <h1>1252.95</h1>
                  </div>
                </div>
              </Col>
            </Row>
          </div> */}

          <Row>
            <Col sm={12} md={12}>
              {!isLoading
                ? (
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Subscription Name</th>
                        <th>Price (USD/month)</th>
                        <th>Status</th>
                        <th> </th>
                        <th> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions && subscriptions.map((sub) => (
                        <tr key={sub.id}>
                          <td>{sub.creator.creatorTitle}</td>
                          <td align="center">
                            $
                            {sub.creator.price}
                          </td>
                          <td>
                            {sub.status ? <Alert color="success">Active</Alert>
                              : <Alert color="danger">Expired</Alert>}
                          </td>
                          <td>
                            {sub.status && sub.stripeSubId ? (
                              <button
                                type="button"
                                className="btn btn-dark"
                                onClick={() => router.push(customerPortalLink)}
                              >
                                Manage Subscription
                              </button>
                            ) : null}
                          </td>
                          <td>
                            {sub.status && sub.stripeSubId ? (
                              <Button
                                color="danger"
                                onClick={() => router.push(customerPortalLink)}
                              >
                                Cancel
                              </Button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Spinner style={{ width: '3rem', height: '3rem' }} />
                )}
            </Col>
          </Row>
        </Container>
      </div>
    </Layout>
  );
};

export default Subscriptions;
