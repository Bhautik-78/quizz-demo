import React, { useRef, useState } from 'react';
import styles from './index.module.scss';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ReactPlayer from 'react-player';
import { Modal } from 'reactstrap';
import axios from 'axios';
const emailValidate = require('email-validator');

const Masterclass = () => {
  const router = useRouter();
  const player = useRef(null);
  const [playState, setPlayState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [light, setLight] = useState('/Assets/masterclass/preview.png');
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [name, setName] = useState('');
  const [addedToWaitlist, setAddedToWaitlist] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setLoading] = useState(false);
  const creatorId = 'cksenfr9o0070acv8w5nssb90';

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
          lastName,
        };
        const resp = await axios.post(
          '/api/sundae/accounts/waitlisters/add',
          data
        );
        console.log(resp);
        setAddedToWaitlist(true);
        setShowModal(false);
        setPlayState(true);
        setLight(false);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.master_class_container}>
      <Head>
        <title>Sundae - Chef Authorized - Masterclass</title>
      </Head>
      <div className={styles.header_sec}>
        <button
          className='btn'
          onClick={() => {
            router.push('https://www.getsundae.com/chefauthorized');
          }}
        >
          Sign up for Chef Authorized Cooking Academy{' '}
        </button>
      </div>
      <section className={styles.master_class_body}>
        <div className={styles.content_sec}>
          <h1>Chef Authorized Cooking Academy</h1>
          <div className={styles.video_sec}>
            <ReactPlayer
              ref={player}
              url={
                'https://millieapp.s3.amazonaws.com/content/chefbrandon/KnifeSharpening.mp4'
              }
              width='100%'
              height="500px"
              controls={true}
              playing={playState}
              light={light}
              config={{
                file: {
                  attributes: {
                    onContextMenu: e => e.preventDefault(),
                    controlsList: 'nodownload'
                  }
                }
              }}
              onClickPreview={e => {
                if (!addedToWaitlist) {
                  player.current.showPreview();
                  setShowModal(true);
                } else {
                  setLight(false);
                  setPlayState(true);
                }
              }}
            />
          </div>
          <div className={styles.info_sec}>
            <img src='/Assets/masterclass/cheif.png' />
            <p>Knife Sharpening Class</p>
          </div>
          <div className={styles.desc_sec}>
            <p>
              This is a free knife sharpening course straight from a chef to
              you. You maybe a young culinarian or a home chef, but before you
              spend the $$$ buying a Japanese knife, learn the basics, the tools
              and the techniques needed to sharpen your kitchen knives.
            </p>
          </div>
        </div>
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
            <h1>{addedToWaitlist ? null : 'Access the Free Masterclass'}</h1>
          </div>
          <div className={styles.modal_body}>
            {addedToWaitlist ? (
              <div>
                Thanks for signing up! You've been added to the waitlist.
              </div>
            ) : (
              <div className={styles.form_container}>
                <div className='form-input-container'>
                  <label>Name</label>
                  <input
                    type='text'
                    placeholder='Your Name'
                    value={name}
                    onChange={e => {
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
                    onChange={e => {
                      setInitErrors();
                      setEmail(e.target.value.trim());
                    }}
                    required
                  />
                  <small className='text-danger pl-2'>
                    {clientErr.email ? clientErr.email : ''}
                  </small>
                </div>
                <div className={styles.btn_container}>
                  <button
                    type='button'
                    className='btn btn-dark btn-block'
                    onClick={doAddToWaitlist}
                    disabled={isLoading ? 'disabled' : ''}
                  >
                    {isLoading ? 'Please wait...' : 'Access the Masterclass'}
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

export default Masterclass;
