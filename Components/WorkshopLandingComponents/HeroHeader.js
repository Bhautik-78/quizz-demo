/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import {
  Col, Row,
  Modal,
  Alert,
} from 'reactstrap';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from './hero.module.scss';
import { workshopThemes } from '../../Utils/workshoptheme';

const emailValidate = require('email-validator');

const HeroHeader = ({
  data, creator, pageStyles, handle,
  workshopHandle
}) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [email, setEmail] = useState('');
  const [isOpen, setOpen] = useState(false);
  const [buttonText, setButtonText] = useState(' Purchase Now');
  const [isFreeModalOpen, setFreeModalOpen] = useState(false);
  const [joinedFreeWorkshop, setJoinedWorkshop] = useState(false);

  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [name, setName] = useState('');
  const [clientErr, setClientErr] = useState({
    email: '',
    name: '',
  });

  const setInitErrors = () => {
    setClientErr({
      name: '',
      email: '',
    });
  };

  useEffect(() => {
    if (data) {
      if (data.isFree) {
        setButtonText(' Join Free Workshop');
      }
    }
  }, [data]);

  const setInitialErrors = () => {
    setClientErr({
      email: '',
    });
    setServerErr(null);
  };

  const handleClick = async () => {
    if (data.isFree) {
      setFreeModalOpen(true);
    } else {
      doCreationSession();
    }
  };

  const doJoinWorkshop = async () => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!firstName) {
      errorsCopy.name = 'Name is required';
      isError = true;
    }

    if (!email) {
      errorsCopy.email = 'Email is required!';
      isError = true;
    } else if (!emailValidate.validate(email)) {
      errorsCopy.email = 'Email is invalid';
      isError = true;
    }

    if (isError) {
      setClientErr({ ...errorsCopy });
    } else {
      setLoading(true);
      try {
        const freeBuyerData = {
          email,
          firstName,
          lastName
        };
        const resp = await axios.post(
          `/api/sundae/workshop/${data.id}/buyFreeWorkshop`,
          freeBuyerData
        );
        console.log(resp);
        setJoinedWorkshop(true);
        router.push(`/creators/${handle}/workshops/success`);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const doCreationSession = async () => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!email) {
      errorsCopy.email = 'Email is required';
      isError = true;
    } else if (!emailValidate.validate(email)) {
      errorsCopy.email = 'Email is invalid';
      isError = true;
    }
    if (isError) {
      setClientErr({ ...errorsCopy });
    } else {
      const finalData = {
        workshopId: data.id,
        email,
        successUrl: `https://${window.location.hostname}/creators/${handle}/workshops/success`,
        cancelUrl: `https://${window.location.hostname}/creators/${handle}/workshops/${workshopHandle}`,
      };
      setLoading(true);
      try {
        const response = await axios.post(
          '/api/sundae/subscription/createWorkshopSubscription',
          finalData
        );
        try {
          const leadData = {
            offeringId: data.id,
            offeringType: 'WORKSHOP',
            creatorId: creator.id,
            email,
          };
          const resp = await axios.post(
            '/api/sundae/accounts/waitlisters/add',
            leadData
          );
          console.log(resp);
        } catch (e) {
          console.error(e);
        }
        // console.log(JSON.parse(response.data.data.sessionData).url, ',,,,,,,upuooooooooo');
        window.location.replace(JSON.parse(response.data.data.sessionData).url);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
        setServerErr('Processing error -- Try again');
        setOpen(true);
      }
    }
  };

  return (
    <div style={{ backgroundImage:`url(${pageStyles?.headerBackground || workshopThemes[0].headerBackground})` }} className={styles.hero_header_container}>
      <section className={styles.hero_header_content}>
        <Row className="flex-column-reverse flex-lg-row">
          <Col sm={12} md={12} lg={6}>
            <section className={styles.section_left}>
              <h1>{data?.title}</h1>
              <p>
                {data?.topDescription.length > 600 ? (
                  `${data.topDescription.substr(0, 600)}...`
                ) : (
                  data?.topDescription
                )}
              </p>
              <div style={{ border:`1px solid ${pageStyles?.headerButtonBg || workshopThemes[0].headerButtonBg}` }} className={styles.send_email_container}>
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => {
                    setInitialErrors();
                    setEmail(e.target.value);
                  }}
                  required
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleClick()}
                  style={{ background:`${pageStyles?.headerButtonBg || workshopThemes[0].headerButtonBg}` }}
                  className="btn"
                >
                  {isLoading ? 'Please wait...' : buttonText}
                </button>
              </div>
              <small className="text-danger pl-2">
                {clientErr.email ? clientErr.email : ''}
              </small>
            </section>
          </Col>
          <Col sm={12} md={12} lg={6}>
            <section className={styles.section_right}>
              <img src={data?.media && data?.media[0]?.srcUrl || data?.mediaUrls[0]?.srcUrl} alt="workshop" />
            </section>
          </Col>
        </Row>
        <Modal centered isOpen={isOpen} toggle={() => setOpen(false)}>
          <div className="p-3">
            <Alert color="danger">{serverErr}</Alert>
          </div>
        </Modal>
        <Modal centered isOpen={isFreeModalOpen} toggle={() => setFreeModalOpen(false)}>
          <div className={styles.join_list_modal}>
            <span
              onClick={() => setFreeModalOpen(false)}
              className={styles.cross_icon}
            >
              x
            </span>
            <div className={styles.modal_header}>
              <h1>{joinedFreeWorkshop ? null : 'Join workshop'}</h1>
            </div>
            <div className={styles.modal_body}>
              {joinedFreeWorkshop ? (
                <div>
                  Thanks for registering! You will get notified shortly.
                </div>
              ) : (
                <div className={styles.form_container}>
                  <div className="form-input-container">
                    <label>Name</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => {
                        const nameStr = e.target.value.trim();
                        setName(e.target.value);
                        setInitErrors();
                        if (nameStr) {
                          const [fname, lname] = nameStr.split(' ');
                          setFirstName(fname);
                          setLastName(lname);
                        } else {
                          setFirstName(null);
                          setLastName(null);
                        }
                      }}
                      required
                    />
                    <small className="text-danger pl-2">
                      {clientErr.name ? clientErr.name : ''}
                    </small>
                  </div>
                  <div className="form-input-container">
                    <label>Email</label>
                    <input
                      type="text"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => {
                        setInitErrors();
                        setEmail(e.target.value.trim());
                      }}
                      required
                    />
                    <small className="text-danger pl-2">
                      {clientErr.email ? clientErr.email : ''}
                    </small>
                  </div>
                  <div className={styles.btn_container}>
                    <button
                      type="button"
                      className="btn btn-block"
                      style={{ background:`${pageStyles?.headerButtonBg || workshopThemes[0].headerButtonBg}` }}
                      onClick={doJoinWorkshop}
                      disabled={isLoading ? 'disabled' : ''}
                    >
                      {isLoading ? 'Registering...' : 'Register Now'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </section>
    </div>
  );
};

export default HeroHeader;
