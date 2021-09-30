import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { useSession } from 'next-auth/client';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  CustomInput,
} from 'reactstrap';
import axios from 'axios';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import Layout from '../../../../Components/Layout/Layout';
import WorkshopSessionCard from '../../../../Components/WorkshopSessionCard';
import SessionEditor from '../../../../Components/SesssionEditor/SessionEditor';
import styles from './workshopsession.module.scss';

const { checkURI } = require('node-uri');

const WorkshopSessions = ({ workshopId }) => {
  const router = useRouter();
  const { title } = router.query;
  const [session, loading] = useSession();

  const [workshopTitle, setWorkshopTitle] = useState('');
  const [workshopSessions, setWorkshopSessions] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [sessionId, setSessionId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionNumber, setSessionNumber] = useState(0);
  const [sessionRedirectUrl, setSessionRedirectUrl] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [workshopLink, setWorkshopLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const [htmlContent, setHtmlContent] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const [viewSessionModal, setViewSessionModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentDes, setCurrentDes] = useState(null);
  const [isFlag, setFlag] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [clientErr, setClientErr] = useState({
    sessionTitle: '',
    sessionDescription: '',
    sessionRedirectUrl: '',
  });
  const doEditAction = item => {
    console.log(item, 'sssssssssssss');
    const convertedState = convertFromRaw(JSON.parse(item.description));
    setEditorState(EditorState.createWithContent(convertedState));
    setSessionTitle(item?.title);
    setSessionNumber(item?.sessionNumber);
    setSessionRedirectUrl(item?.redirectUrl);
    setIsPublished(item?.isPublished);
    setSessionId(item?.id);
    setIsOpen(true);
  };
  const setInitialErrors = () => {
    setClientErr({
      sessionTitle: '',
      sessionDescription: '',
      sessionRedirectUrl: '',
    });
    setServerErr(null);
  };

  const setInitialState = () => {
    setIsOpen(false);
    setSessionNumber(0);
    setSessionTitle('');
    setIsPublished(false);
    setSessionDescription('');
    setSessionRedirectUrl('');
    setEditorState(EditorState.createEmpty());
    setSessionId('');
  };

  const updateWorkshopSession = async () => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!sessionTitle.trim()) {
      errorsCopy.sessionTitle = 'Title is required';
      isError = true;
    }
    if (isError) {
      setClientErr({ ...errorsCopy });
    } else {
      setLoading(true);
      try {
        const data = {
          id: sessionId,
          workshopId,
          title: sessionTitle,
          isPublished,
          sessionNumber,
          redirectUrl: sessionRedirectUrl,
          description: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
        };
        console.log(data, 'ypppppppppppppppppppppppp');
        const resp = await axios.post(
          `/api/sundae/workshop/${workshopId}/workshopsessions/edit`,
          data
        );

        if (resp.data.errorMessage) {
          setFlag(!isFlag);
          setServerErr(resp.data.errorMessage);
        } else {
          setFlag(!isFlag);
          setInitialState();
          // router.reload();
        }
      } catch (e) {
        setFlag(!isFlag);
        console.error(e);
        setServerErr(e.toString());
      } finally {
        setFlag(!isFlag);
        // setLoading(false);
      }
    }
  };
  const addWorkshopSession = async () => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!sessionTitle.trim()) {
      errorsCopy.sessionTitle = 'Title is required';
      isError = true;
    }

    // if (!sessionDescription.trim()) {
    //   errorsCopy.sessionDescription = 'Description is required';
    //   isError = true;
    // }

    // if (sessionRedirectUrl.trim()) {
    //   try {
    //     checkURI(sessionRedirectUrl.trim());
    //   } catch (err) {
    //     console.error(err);
    //     errorsCopy.sessionRedirectUrl = 'URL entered is invalid';
    //     isError = true;
    //   }
    // }

    if (isError) {
      setClientErr({ ...errorsCopy });
    } else {
      setLoading(true);
      setWorkshopSessions(null)
      try {
        const data = {
          workshopId,
          title: sessionTitle,
          isPublished,
          sessionNumber,
          redirectUrl: sessionRedirectUrl,
          description: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
        };
        console.log(data, 'ypppppppppppppppppppppppp');
        const resp = await axios.post(
          `/api/sundae/workshop/${workshopId}/workshopsessions/add`,
          data
        );

        if (resp.data.errorMessage) {
          setFlag(!isFlag);
          setServerErr(resp.data.errorMessage);
        } else {
          setFlag(!isFlag);
          setInitialState();
          // router.reload();
        }
      } catch (e) {
        setFlag(!isFlag);
        console.error(e);
        setServerErr(e.toString());
      } finally {
        setFlag(!isFlag);
        // setLoading(false);
      }
    }
  };

  useEffect(() => {
    setWorkshopTitle(title);
    const getWorkshopSessions = async () => {
      try {
        setLoading(true);
        const resp = await axios.get(
          `/api/sundae/workshop/${workshopId}/workshopsessions`
        );

        if (resp.data.errorMessage) {
          setServerErr(resp.data.errorMessage);
        } else {
          console.log(resp.data ,"check it")
          setWorkshopSessions(resp.data.workshopSessions);
        }
      } catch (e) {
        setServerErr(e.toString());
      } finally {
        setLoading(false);
      }
    };
    getWorkshopSessions();
  }, [title, workshopId, isFlag]);

  useEffect(() => {
    // console.log(router.query.handle,"v.v.v.")
    if (session) {
      const { user } = session;
      const { sundaeUser } = user;
      if (sundaeUser) {
        console.log(sundaeUser);
        setWorkshopLink(
          `https://${window.location.hostname}/creators/${sundaeUser.handle}/workshops/${router?.query?.handle}`
        );
      }
    }
  }, [session])

  if (loading) return null;

  if (!loading && !session) {
    router.push('/');
  }

  const doSetCurrentSession = item => {
    const convertedState = convertFromRaw(JSON.parse(item.description));
    setCurrentDes(EditorState.createWithContent(convertedState));
    setCurrentSession(item);
    setViewSessionModal(true);
  };
  return (
    <Layout>
      <div className={styles.workshopsession_container}>
        {serverErr ? <Alert color='danger'>{serverErr}</Alert> : ''}
        <Container>
          <h1>
            {workshopTitle}{' '}
            <img
              onClick={() => router.push(`/workshops/${workshopId}/edit`)}
              src='/Assets/eidt.svg'
              alt='edit'
            />{' '}
            <Button color='danger' onClick={() => console.log('clicked')}>
              Delete
            </Button>
            {'  '}
            <Button
              color='primary'
              onClick={() => router.push(`/workshops/${workshopId}/sendemail`)}
            >
              Send Email
            </Button>
          </h1>
          <hr />
          <Row>
            <Col sm={12} md={12}>
            <div className="input-group mb-3">
                <input
                  type="text"
                  disabled
                  className="form-control"
                  value={workshopLink}
                />
                <div className="input-group-append">
                  <CopyToClipboard text={workshopLink} onCopy={() => setLinkCopied(true)}>
                    <button type="button" className="input-group-text btn btn-dark">{linkCopied ? 'Copied!' : 'Copy Workshop URL'}</button>
                  </CopyToClipboard>
                </div>
              </div>
            </Col>
            <Col sm={12} md={12}>
              {/* <div className={styles.add_workshopsession_btn_container}>
                <div
                  onClick={() => setIsOpen(true)}
                  className={styles.add_workshopsession_btn}
                >
                  <img src='/Assets/add_icon.png' alt='Add Worshop Session' />
                </div>
                <p>Add Workshop Session</p>
              </div> */}
              <button
                onClick={() => setIsOpen(true)}
                className='btn btn-dark mt-3 mb-3'
              >
                Add Workshop Session
              </button>
            </Col>
          </Row>
          <table className='table table-hover'>
            <thead>
              <tr>
                <th scope='col'>#</th>
                <th scope='col'>Title</th>
                {/* <th scope='col'>Redirect URL</th> */}
                <th scope='col'>Created At</th>
                <th scope='col'></th>
                <th scope='col'></th>
              </tr>
            </thead>
            <tbody>
              {workshopSessions
                && workshopSessions.map((item, i) => {
                    return (
                      <tr key={i} >
                        <th scope='row'> {i + 1} </th>
                        <td> {item.title} </td>
                        {/* <td> {item.redirectUrl} </td> */}
                        <td> {moment(item.createdAt).format('MM/DD/YYYY')} </td>
                        <td>
                          <a
                            onClick={() => {
                              doSetCurrentSession(item);
                            }}
                            href='#'
                          >
                            <img src='/Assets/eye.png' />
                          </a>
                        </td>
                        <td>
                          <a
                            onClick={() => {
                              doEditAction(item);
                            }}
                            href='#'
                          >
                            <img src='/Assets/edit.png' />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                }
            </tbody>
          </table>
          {workshopSessions && workshopSessions.length === 0 ? <h2>No sessions available</h2>:""}
          {isLoading ? (
            <Spinner style={{ width: '3rem', height: '3rem' }} />
          ) : (
            ''
          )}
          {/* <Row>
            {workshopSessions
              ? workshopSessions.map(item => (
                  <Col Key={item.id} sm={12} md={3}>
                    <WorkshopSessionCard
                      workshopId={workshopId}
                      workshopSession={item}
                      workshopTitle={workshopTitle}
                    />
                  </Col>
                ))
              : ''}
          </Row> */}
        </Container>
        <Modal
          className='custom-modal'
          centered
          isOpen={viewSessionModal}
          toggle={() => setViewSessionModal(false)}
        >
          <ModalHeader
            className={styles.workshopsession_modal_header}
            toggle={() => setViewSessionModal(false)}
          >
            View Session (# {currentSession?.sessionNumber})
          </ModalHeader>
          <ModalBody>
            <div className={styles.workshopsession_view_modal}>
              <h1>{currentSession?.title}</h1>
              <p>
                <a href={currentSession?.redirectUrl} target='_blank'>
                  {currentSession?.redirectUrl}
                </a>
              </p>
              <div className={styles.gridmobile}>
                {currentDes ? (
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: stateToHTML(currentDes.getCurrentContent()),
                    }}
                  />
                ) : (
                  ''
                )}
              </div>
            </div>
          </ModalBody>
        </Modal>
        <Modal
          className='custom-modal'
          centered
          isOpen={isOpen}
          toggle={() => setInitialState()}
        >
          <ModalHeader
            className={styles.workshopsession_modal_header}
            toggle={() => setInitialState()}
          >
            {sessionId ? 'Update' : 'Add'} Workshop Session
          </ModalHeader>
          <ModalBody>
            <div className={styles.workshopsession_form_container}>
              <div className='form-input-container'>
                <label>Title</label>
                <input
                  type='text'
                  placeholder='Enter the session title'
                  value={sessionTitle}
                  onChange={e => {
                    console.log(e.target.value);
                    // setInitialErrors();
                    setSessionTitle(e.target.value);
                  }}
                />
                <small className='text-danger pl-2'>
                  {clientErr.sessionTitle ? clientErr.sessionTitle : ''}
                </small>
              </div>
              <div className='form-input-container'>
                <CustomInput
                  type='switch'
                  id='publishedSwitch'
                  name='publishSwitch'
                  label='Publish'
                  value={isPublished}
                  checked={isPublished}
                  onChange={() => {
                    setInitialErrors();
                    setIsPublished(!isPublished);
                  }}
                />
              </div>
              <div className='form-input-container'>
                <label>Session #</label>
                <input
                  min={1}
                  type='number'
                  placeholder='Enter the workshop session number'
                  value={sessionNumber}
                  onChange={e => {
                    setInitialErrors();
                    setSessionNumber(parseInt(e.target.value, 10));
                  }}
                />
              </div>
              <div className='form-input-container'>
                <label>Redirect URL (optional)</label>
                <input
                  type='url'
                  placeholder='Valid URL you want people to get redirected to'
                  value={sessionRedirectUrl}
                  onChange={e => {
                    setInitialErrors();
                    setSessionRedirectUrl(e.target.value);
                  }}
                />
                <small className='text-danger pl-2'>
                  {clientErr.sessionRedirectUrl
                    ? clientErr.sessionRedirectUrl
                    : ''}
                </small>
              </div>
              <div className='form-input-container'>
                <label>Session Description</label>
                {/* <textarea
                  rows="3"
                  placeholder="Enter a brief description about what this session entails"
                  value={sessionDescription}
                  onChange={(e) => {
                    setInitialErrors();
                    setSessionDescription(e.target.value);
                  }}
                />  */}
                <SessionEditor
                  htmlContent={htmlContent}
                  setHtmlContent={setHtmlContent}
                  editorState={editorState}
                  setEditorState={setEditorState}
                />
              </div>
              <div className={styles.btn_container}>
                {sessionId ? (
                  <button
                    type='button'
                    onClick={updateWorkshopSession}
                    disabled={isLoading ? 'disabled' : ''}
                    className='btn btn-dark btn-block'
                  >
                    {isLoading ? 'Updating...' : 'Update Workshop Session'}
                  </button>
                ) : (
                  <button
                    type='button'
                    onClick={addWorkshopSession}
                    disabled={isLoading ? 'disabled' : ''}
                    className='btn btn-dark btn-block'
                  >
                    {isLoading ? 'Adding...' : 'Add Workshop Session'}
                  </button>
                )}
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
  return {
    props: {
      ...params,
    },
  };
}

export default WorkshopSessions;
