import React, { useRef, useEffect, useState } from 'react';
import styles from './sathacks.module.scss';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ReactPlayer from 'react-player';
import { Modal } from 'reactstrap';
import axios from 'axios';
const emailValidate = require('email-validator');

const SATHacks = ({ handle }) => {
  const router = useRouter();
  const player = useRef(null);
  const [playState, setPlayState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [light, setLight] = useState('https://millieapp.s3.amazonaws.com/content/danstestprep/leadmagnet.jpg');
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
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
          handle: 'my-top-5-sat-hacks',
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
        <title>Sundae - Dan's Test Prep - SAT Hacks</title>
      </Head>
      <div className={styles.header_sec}>
        <button
          className='btn'
          onClick={() => {
            router.push('https://www.getsundae.com/danstestprep');
          }}
        >
          Sign up for Dan's Test Prep{' '}
        </button>
      </div>
      <section className={styles.master_class_body}>
        <div className={styles.content_sec}>
          <h1>Dan's Test Prep</h1>
          <div className={styles.video_sec}>
            <ReactPlayer
              ref={player}
              url={
                'https://millieapp.s3.amazonaws.com/content/danstestprep/LeadMagnet1.mp4'
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
            <img src='https://millieapp.s3.amazonaws.com/content/dan.jpeg' />
            <p>My Top 5 SAT Hacks</p>
          </div>
          <div className={styles.desc_sec}>
            <p>
            The SAT can be hard. But when equipped with the right tools,
             I believe anyone can get through the test. That’s why I’m
             giving out my top five SAT math tips and tricks! These math
             hacks will help you approach questions in new ways, get
             through the test faster, and ultimately score higher.
             Let’s get going and learn something new!
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
            <h1>{addedToWaitlist ? null : 'Access the Video'}</h1>
          </div>
          <div className={styles.modal_body}>
            {addedToWaitlist ? (
              <div>
                Thanks for signing up!
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
                    {isLoading ? 'Please wait...' : 'Access the Video'}
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
    }
  };
}

export default SATHacks;
