import React, { useState, useEffect } from 'react';
import { Modal } from 'reactstrap';
import axios from 'axios';
import Head from 'next/head';
import styles from './phrasalverbs.module.scss';
import HeroHeader from '../../../../Components/NolaHayes/HeroHeader';

const emailValidate = require('email-validator');

const ChallengingLanguages = ({ handle }) => {
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [pageTitle, setPageTitle] = useState('Workshop');
  const [name, setName] = useState('');
  const [addedToWaitlist, setAddedToWaitlist] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [workshop, setWorkshop] = useState();
  const [creatorId, setCreatorId] = useState('');
  const [serverErr, setServerErr] = useState(null);

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
    const getCreatorByHandle = async () => {
      try {
        const resp = await axios.post(
          '/api/sundae/accounts/creators/creatorByHandle',
          { handle }
        );
        // console.log(resp, '............./////////.............');
        if (!resp.data.errorMessage) {
          setCreatorId(resp.data.creator.id);
        }
      } catch (e) {
        console.log(e);
      }
    };
    const getCreatorWorkshop = async () => {
      try {
        setLoading(true);
        const resp = await axios.post('/api/sundae/workshop/workshopByHandle', {
          handle: 'the-three-most-challenging-languages-to-learn',
        });
        console.log(resp.data, 'finally..................');
        if (resp.data.errorMessage) {
          setServerErr(resp.data.errorMessage);
        } else {
          setWorkshop(resp.data.workshop);
        }
      } catch (e) {
        setServerErr(e.toString());
      } finally {
        setLoading(false);
      }
    };
    getCreatorWorkshop();
    getCreatorByHandle();
  }, [handle]);

  useEffect(() => {
    if (workshop) {
      setPageTitle(workshop.title);
    }
  }, [workshop]);

  const doAddToWaitlist = async () => {
    console.log('here?');
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!firstName) {
      errorsCopy.name = 'Name is required!';
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
        const data = {
          offeringId: workshop.id,
          offeringType: 'WORKSHOP',
          creatorId,
          email,
          firstName,
          lastName,
        };
        const resp = await axios.post(
          '/api/sundae/accounts/waitlisters/add',
          data
        );
        console.log(resp);
        setAddedToWaitlist(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.landing_container}>
      <Head>
        <title>
          Sundae -
          {pageTitle}
        </title>
      </Head>
      <HeroHeader setShowModal={setShowModal} />
      <section className={styles.after_header_container}>
        <div className={styles.content_container}>
          <p>
          During this free LIVE session, I will cover in detail
          the three most difficult languages to learn: Mandarin, French and English.
          Join me to learn why these languages are so challenging and how to tackle
           studying each of them!  Want to learn how you can effectively study
           and gain fluency in only a few short months? I???ll tell all of my favorite
           and best-kept study secrets during this LIVE session!
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn">
          Register Now
        </button>
      </section>
      <Modal centered isOpen={showModal} toggle={() => setShowModal(false)}>
        <div className={styles.join_list_modal}>
          <span
            onClick={() => setShowModal(false)}
            className={styles.cross_icon}
          >
            x
          </span>
          <div className={styles.modal_header}>
            <h1>{addedToWaitlist ? null : 'Registeration'}</h1>
          </div>
          <div className={styles.modal_body}>
            {addedToWaitlist ? (
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
                    className="btn btn-dark btn-block"
                    onClick={doAddToWaitlist}
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
    </div>
  );
};

export async function getServerSideProps({ params }) {
  return {
    props: {
      ...params,
    },
  };
}

export default ChallengingLanguages;
