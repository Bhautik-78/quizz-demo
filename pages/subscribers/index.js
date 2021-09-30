import { useRouter } from 'next/router';

import { ExportToCsv } from 'export-to-csv';
import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/client';

import {
  Container, Row, Col, Alert, Table, Spinner,
  TabContent, TabPane, Nav, NavItem, NavLink,
  Modal, ModalBody, ModalHeader,
} from 'reactstrap';
import classnames from 'classnames';
import axios from 'axios';
import Head from 'next/head';
import Layout from '../../Components/Layout/Layout';
import styles from './subscribers.module.scss';
import SendLeadsEmail from '../../Components/Leads/SendLeadsEmail';

const dateformat = require('dateformat');

const Subscribers = () => {
  const router = useRouter();
  const [session, loading] = useSession();

  const [userSubscriptions, setUserSubscriptions] = useState();
  const [waitlisters, setWaitlist] = useState();
  const [workshopUsers, setWorkshopUsers] = useState();
  const [activeSubs, setActiveSubs] = useState(0);
  const [totalSubs, setTotalSubs] = useState(0);
  const [totalWorkshopUsers, setTotalWorkshopUsers] = useState(0);
  const [sortConfig, setSortConfig] = useState(null);

  const [activeTab, setActiveTab] = useState('1');

  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);

  const [viewSendLeadEmailModal, setLeadEmailModal] = useState(false);

  const tabToggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    if (session) {
      const getUserSubscriptions = async () => {
        try {
          setLoading(true);
          const resp = await axios.get(
            '/api/sundae/accounts/creators/subscribers'
          );
          if (resp.data.errorMessage) {
            setServerErr(resp.data.errorMessage);
          } else {
            let activeSubCount = 0;
            const formattedContent = resp.data.userSubscriptions.map((item) => {
              const { user } = item;
              const startDate = new Date(item.startDate).toString();
              delete item.startDate;
              const name = `${user.firstName ? user.firstName : 'Anonymous'} ${
                user.lastName ? user.lastName : ''
              }`.trim();
              let status = false;
              const expiresOn = new Date(item.expiresOn);
              const now = new Date();
              if (now < expiresOn) {
                status = true;
                activeSubCount += 1;
              }
              return {
                ...item,
                startDate,
                name,
                email: user.email,
                status,
              };
            });
            console.log(formattedContent, 'yoooo');
            setUserSubscriptions(formattedContent);
            setTotalSubs(formattedContent.length);
            setActiveSubs(activeSubCount);
          }
        } catch (e) {
          setServerErr(e.toString());
        } finally {
          setLoading(false);
        }
      };
      getUserSubscriptions();

      const getWaitlist = async () => {
        try {
          setLoading(true);
          const resp = await axios.get(
            '/api/sundae/accounts/waitlisters'
          );
          if (resp.data.errorMessage) {
            setServerErr(resp.data.errorMessage);
          } else {
            const formattedContent = resp.data.waitlisters.map((item) => {
              const { user } = item;
              const createdAt = new Date(item.createdAt).toString();
              delete item.createdAt;
              const name = `${user.firstName ? user.firstName : 'Anonymous'} ${
                user.lastName ? user.lastName : ''
              }`.trim();
              return {
                ...item,
                name,
                email: user.email,
                createdAt,
              };
            });
            setWaitlist(formattedContent);
          }
        } catch (e) {
          setServerErr(e.toString());
        } finally {
          setLoading(false);
        }
      };
      getWaitlist();

      const getWorkshopUsers = async () => {
        try {
          setLoading(true);
          const resp = await axios.get(
            '/api/sundae/workshop/workshopusers'
          );
          if (resp.data.errorMessage) {
            setServerErr(resp.data.errorMessage);
          } else {
            const formattedContent = resp.data.workshopUsers.map((item) => {
              const createdAt = new Date(item.createdAt).toString();
              delete item.createdAt;
              let user;
              let name;
              if (item.purchaseType === 'PAID') {
                user = JSON.parse(item.stripeCustomer);
                name = user.name || 'Anonymous';
              } else {
                ({ user } = item);
                name = `${user.firstName || 'Anonymous'} ${user.lastName || ''}`.trim();
                item.workshop.price = '0.00';
              }
              const { workshop } = item;
              return {
                ...item,
                name,
                email: user.email,
                workshopTitle: workshop.title,
                price: workshop.price,
                createdAt,
              };
            });
            setWorkshopUsers(formattedContent);
            setTotalWorkshopUsers(formattedContent.length);
          }
        } catch (e) {
          setServerErr(e.toString());
        } finally {
          setLoading(false);
        }
      };
      getWorkshopUsers();
    }
  }, [session]);

  useMemo(() => {
    if (sortConfig !== null) {
      const sortedSubs = [...userSubscriptions];
      sortedSubs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
      setUserSubscriptions(sortedSubs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortConfig]);

  const requestSort = (key) => {
    console.log(sortConfig);
    let direction = 'ascending';
    if (
      sortConfig !== null
      && sortConfig.key === key
      && sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  if (loading) return null;

  if (!loading && !session) {
    router.push('/');
    return null;
  }

  const doExportCsv = () => {
    if (activeTab === '1') {
      if (userSubscriptions.length < 1) {
        return;
      }
      const options = {
        filename: 'subscribers',
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: '',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
      };
      const csvExporter = new ExportToCsv(options);
      const updatedData = userSubscriptions.map((item) => {
        const itemCopy = { ...item };
        if (itemCopy.status) {
          itemCopy.status = 'Active';
        } else {
          itemCopy.status = 'Expired';
        }
        return itemCopy;
      });
      csvExporter.generateCsv(updatedData);
    } else if (activeTab === '2') {
      if (waitlisters.length < 1) {
        return;
      }
      const options = {
        filename: 'leads',
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: '',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
      };
      const csvExporter = new ExportToCsv(options);
      const updatedData = waitlisters.map((item) => {
        const itemCopy = { ...item };
        itemCopy.createdAt = dateformat(item.createdAt);
        delete itemCopy.user;
        delete itemCopy.id;
        const { offering, offeringType } = itemCopy;
        const offeringObj = JSON.parse(offering);
        if (offeringType === 'SUBSCRIPTION') {
          itemCopy.offering = offeringObj.creatorTitle;
        } else if (offeringType === 'WORKSHOP') {
          itemCopy.offering = offeringObj.title;
        } else {
          itemCopy.offering = 'N/A';
        }
        return itemCopy;
      });
      csvExporter.generateCsv(updatedData);
    } else {
      if (workshopUsers.length < 1) {
        return;
      }
      const options = {
        filename: 'workshop_users',
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: '',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
      };
      const csvExporter = new ExportToCsv(options);
      const updatedData = workshopUsers.map((item) => {
        const itemCopy = { ...item };
        itemCopy.createdAt = dateformat(item.createdAt);
        delete itemCopy.stripeCustomer;
        delete itemCopy.id;
        delete itemCopy.workshop;
        delete itemCopy.user;
        return itemCopy;
      });
      csvExporter.generateCsv(updatedData);
    }
  };
  return (
    <Layout>
      <Head>
        <title>Sundae - My Users</title>
      </Head>
      <div className={styles.subscribers_container}>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        <Container>
          <h1>User Metrics</h1>
          <hr />
          <div className={styles.top_stats_container}>
            <Row>
              <Col sm={12} md={3}>
                <div className={styles.stats_item}>
                  <div className={styles.img_container}>
                    <img src="/Assets/stats_1.png" alt="stats1" />
                  </div>
                  <div className={styles.title_container}>
                    <p>Total Users</p>
                    <small style={{ visibility: 'hidden' }}>.</small>
                  </div>
                  <div className={styles.footer_no}>
                    {!isLoading ? (
                      <h1>{totalSubs}</h1>
                    ) : (
                      <Spinner style={{ width: '1rem', height: '1rem' }} />
                    )}
                  </div>
                </div>
              </Col>
              <Col sm={12} md={3}>
                <div className={styles.stats_item}>
                  <div className={styles.img_container}>
                    <img src="/Assets/stats_2.png" alt="stats2"  />
                  </div>
                  <div className={styles.title_container}>
                    <p>Active Subscriptions</p>
                    <small>Including Free Trials</small>
                  </div>
                  <div className={styles.footer_no}>
                    {!isLoading ? (
                      <h1>{activeSubs}</h1>
                    ) : (
                      <Spinner style={{ width: '1rem', height: '1rem' }} />
                    )}
                  </div>
                </div>
              </Col>
              <Col sm={12} md={3}>
                <div className={styles.stats_item}>
                  <div className={styles.img_container}>
                    <img src="/Assets/stats_3.png" alt="Workshop Purchases" />
                  </div>
                  <div className={styles.title_container}>
                    <p>Workshop Purchases</p>
                    <small>Total</small>
                  </div>
                  <div className={styles.footer_no}>
                    {!isLoading ? (
                      <h1>{totalWorkshopUsers}</h1>
                    ) : (
                      <Spinner style={{ width: '1rem', height: '1rem' }} />
                    )}
                  </div>
                </div>
              </Col>
              {/* <Col sm={12} md={3}>
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
              </Col> */}
            </Row>
          </div>
          <br />
          <Row>
            <Col>
              <h1>Users</h1>
            </Col>
            <Col>
              <div style={{ float: 'right' }}>
                <a href="#" style={{ textDecoration: 'none' }} onClick={doExportCsv}>
                  EXPORT TO CSV
                </a>
                { '  ' }
                {activeTab === '2' ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setLeadEmailModal(true)}
                  >
                    Send Email
                  </button>
                ) : null}
              </div>
            </Col>
          </Row>
          <hr />
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '1' })}
                onClick={() => { tabToggle('1'); }}
              >
                Membership
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '3' })}
                onClick={() => { tabToggle('3'); }}
              >
                Workshop
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '2' })}
                onClick={() => { tabToggle('2'); }}
              >
                Potential Customers
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <Row>
                <Col sm={12} md={12}>
                  {!isLoading ? (
                    <Table hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>
                            <button
                              type="button"
                              onClick={() => requestSort('name')}
                              className={getClassNamesFor('name')}
                            >
                              Name
                              {sortConfig && sortConfig.key === 'name'
                              && sortConfig.direction === 'ascending' ? (
                                <img src="/Assets/up.svg" alt="Up" />
                                ) : (
                                  <img src="/Assets/down.svg" alt="Down" />
                                )}
                            </button>
                          </th>
                          <th>
                            <button
                              type="button"
                              onClick={() => requestSort('email')}
                              className={getClassNamesFor('email')}
                            >
                              Email
                              {sortConfig && sortConfig.key === 'email'
                              && sortConfig.direction === 'ascending' ? (
                                <img src="/Assets/up.svg" alt="Up" />
                                ) : (
                                  <img src="/Assets/down.svg" alt="Down" />
                                )}
                            </button>
                          </th>
                          <th>
                            <button
                              type="button"
                              onClick={() => requestSort('startDate')}
                              className={getClassNamesFor('startDate')}
                            >
                              Subscribed On
                              {sortConfig && sortConfig.key === 'startDate'
                              && sortConfig.direction === 'ascending' ? (
                                <img src="/Assets/up.svg" alt="Up" />
                                ) : (
                                  <img src="/Assets/down.svg" alt="Down" />
                                )}
                            </button>
                          </th>
                          <th>
                            <button
                              type="button"
                              onClick={() => requestSort('status')}
                              className={getClassNamesFor('status')}
                            >
                              Status
                              {sortConfig && sortConfig.key === 'status'
                              && sortConfig.direction === 'ascending' ? (
                                <img src="/Assets/up.svg" alt="Up" />
                                ) : (
                                  <img src="/Assets/down.svg" alt="Down" />
                                )}
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userSubscriptions
                          && userSubscriptions.map((sub, i) => (
                            <tr key={sub.id}>
                              <th scope="row">{i}</th>
                              <td>{sub.name}</td>
                              <td>{sub.email}</td>
                              <td>{dateformat(sub.startDate)}</td>
                              <td>
                                {sub.status ? (
                                  <Alert color="success">Active</Alert>
                                ) : (
                                  <Alert color="danger">Expired</Alert>
                                )}
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
            </TabPane>
            <TabPane tabId="2">
              <Row>
                <Col sm={12} md={12}>
                  {!isLoading ? (
                    <Table hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>
                            Email
                          </th>
                          <th>
                            Name
                          </th>
                          <th>
                            Added On
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {waitlisters
                          && waitlisters.map((item, i) => (
                            <tr key={item.id}>
                              <th scope="row">{i}</th>
                              <td>{item.email}</td>
                              <td>{item.name}</td>
                              <td>{dateformat(item.createdAt)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Spinner style={{ width: '3rem', height: '3rem' }} />
                  )}
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="3">
              <Row>
                <Col sm={12} md={12}>
                  {!isLoading ? (
                    <Table hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>
                            Email
                          </th>
                          <th>
                            Name
                          </th>
                          <th>
                            Workshop
                          </th>
                          <th>
                            Price (USD)
                          </th>
                          <th>
                            Bought On
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {workshopUsers
                          && workshopUsers.map((item, i) => (
                            <tr key={item.id}>
                              <th scope="row">{i}</th>
                              <td>{item.email}</td>
                              <td>{item.name}</td>
                              <td>{item.workshopTitle}</td>
                              <td>
                                $
                                {item.price}
                              </td>
                              <td>{dateformat(item.createdAt)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Spinner style={{ width: '3rem', height: '3rem' }} />
                  )}
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </Container>
        <Modal
          className="iframe-modal"
          centered
          isOpen={viewSendLeadEmailModal}
          toggle={() => setLeadEmailModal(false)}
        >
          <ModalHeader>
            Email to potential customers
          </ModalHeader>
          <ModalBody>
            <SendLeadsEmail toggle={setLeadEmailModal} />
          </ModalBody>
        </Modal>
      </div>
    </Layout>
  );
};

export default Subscribers;
