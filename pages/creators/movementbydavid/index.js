/* eslint-disable */
import React, { useState } from 'react';
import { Modal } from 'reactstrap';
import HeroHeader from '../../../Components/MovementByDavidComponents/HeroHeader';
import FeaturesList from '../../../Components/MovementByDavidComponents/FeaturesList';
import PriceSection from '../../../Components/MovementByDavidComponents/PriceSection';
import styles from './index.module.scss';
import axios from 'axios';
import Head from 'next/head'

const emailValidate = require('email-validator');

const Landing = () => {
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [name, setName] = useState('');
  const [addedToWaitlist, setAddedToWaitlist] = useState(false);
  const creatorId =  'ckszpax6400008gv8zi3grb5l';
  const [email, setEmail] = useState('');
  const [isLoading, setLoading] = useState(false);

  const [clientErr, setClientErr] = useState({
    email: '',
    name: ''
  });

  const setInitErrors = () => {
    setClientErr({
      name: '',
      email: ''
    });
  };

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
          offeringId: creatorId,
          offeringType: 'SUBSCRIPTION',
          creatorId,
          email,
          firstName,
          lastName
        };
        const resp = await axios.post('/api/sundae/accounts/waitlisters/add', data);
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
        <title>Sundae - Movement By David</title>
      </Head>
      <HeroHeader setShowModal={setShowModal} />
      <FeaturesList />
      <PriceSection setShowModal={setShowModal} />
      
      <Modal centered isOpen={showModal} toggle={() => setShowModal(false)}>
        <div className={styles.join_list_modal}>
          <span
            onClick={() => setShowModal(false)}
            className={styles.cross_icon}
          >
            x
          </span>
          <div className={styles.modal_header}>
            <h1>{ addedToWaitlist ? null : 'Join the Waitlist' }</h1>
          </div>
          <div className={styles.modal_body}>
              { addedToWaitlist ? (
                <div>
                  Thanks for signing up!  You've been added to the waitlist.
                </div>
              ) : (
                <div className={styles.form_container}>
                  <div className='form-input-container'>
                    <label>Name</label>
                    <input
                      type='text'
                      placeholder='Your Name'
                      value={name}
                      onChange={(e) => {
                        const nameStr = e.target.value.trim();
                        setName(e.target.value);
                        setInitErrors();
                        if (nameStr) {
                          const [fname, lname] = nameStr.split(' ')
                          setFirstName(fname);
                          setLastName(lname);
                        } else {
                          setFirstName(null);
                          setLastName(null);
                        }
                      }}
                      required/>
                    <small className='text-danger pl-2'>
                      {clientErr.name ? clientErr.name : ''}
                    </small>
                  </div>
                  <div className='form-input-container'>
                    <label>Email</label>
                    <input
                      type='text'
                      placeholder='Your Email'
                      value={email}
                      onChange={(e) => {
                        setInitErrors();
                        setEmail(e.target.value.trim());
                      }}
                      required/>
                    <small className='text-danger pl-2'>
                      {clientErr.email ? clientErr.email : ''}
                    </small>
                  </div>
                  <div className={styles.btn_container}>
                    <button
                      type='button'
                      className='btn btn-dark btn-block'
                      onClick={doAddToWaitlist}
                      disabled={isLoading ? 'disabled': ''}>
                      {isLoading ? 'Joining...' : 'Join the Waitlist'}
                    </button>
                  </div>
                </div>
              ) 
            }
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Landing;
