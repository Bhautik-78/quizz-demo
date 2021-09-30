import React, { useState } from 'react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { Alert, Container, CustomInput } from 'reactstrap';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import axios from 'axios';
import EmailEditor from '../../../Components/EmailEditor/EmailEditor';
import Layout from '../../../Components/Layout/Layout';
import styles from './workshopedit.module.scss';

const Sendemail = ({ workshopId }) => {
  const router = useRouter();
  const [session, loading] = useSession();
  const [htmlContent, setHtmlContent] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [emailBody, setEmailBody] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [isTest, setIsTest] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErrr] = useState(null);
  const [isSuccess, setSuccess] = useState(false);
  const [clientErr, setClientErr] = useState({
    emailSubject: '',
    emailBody: '',
  });

  const setInitialErrors = () => {
    setClientErr({
      emailSubject: '',
      emailBody: '',
    });
    setServerErrr(null);
    setSuccess(false);
  };
  const doSendEmail = async () => {
    setServerErrr(null);
    setSuccess(null);
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!emailSubject.trim()) {
      errorsCopy.emailSubject = 'Email Subject is Required';
      isError = true;
    }
    if (!editorState.getCurrentContent().hasText()) {
      errorsCopy.emailBody = 'Email Body is Required';
      isError = true;
    }
    if (isError) {
      setClientErr({ ...errorsCopy });
    } else {
      setLoading(true);
      try {
        const data = {
          workshopId,
          emailBody: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          emailSubject,
          test: isTest,
        };
        console.log(data, 'check');
        const resp = await axios.post('/api/sundae/emails/sendEmail', data);
        setLoading(false);
        setEmailBody('');
        setEditorState(EditorState.createEmpty());
        setEmailSubject('');
        setSuccess(true);
      } catch (e) {
        setLoading(false);
        setServerErrr('Something Went Wrong');
      }
    }
  };
  if (loading) return null;
  if (!loading && !session) {
    router.push('/');
  }
  return (
    <Layout>
      <div className={styles.notifications_container}>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        {isSuccess ? <Alert color="success">Email has been sent</Alert> : ''}
        <Container>
          <h1>Send an Email to Subscribers</h1>
          <hr />
          <div className={styles.send_notification_container}>
            <div className="form-input-container">
              <label>Email Subject</label>
              <input
                type="text"
                placeholder="Enter Email Subject"
                value={emailSubject}
                onChange={(e) => {
                  setInitialErrors();
                  setEmailSubject(e.target.value);
                }}
              />
              <small className="text-danger pl-2">
                {clientErr.emailSubject ? clientErr.emailSubject : ''}
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
                  setIsTest(!isTest);
                }}
              />
            </div>
            <div className="form-input-container">
              <label>Email Body</label>
              <EmailEditor
                htmlContent={htmlContent}
                setHtmlContent={setHtmlContent}
                editorState={editorState}
                setEditorState={setEditorState}
              />
              <small className="text-danger pl-2">
                {clientErr.emailBody ? clientErr.emailBody : ''}
              </small>
            </div>
            <div className={styles.btn_container}>
              <button
                type="button"
                onClick={doSendEmail}
                disabled={isLoading ? 'disabled' : ''}
                className="btn btn-dark btn-block"
              >
                {isLoading
                  ? 'Loading...'
                  : `Send ${isTest ? 'test ' : ' '}Email${
                    isTest ? ' to me' : ''
                  }`}
              </button>
            </div>
          </div>
        </Container>
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

export default Sendemail;
