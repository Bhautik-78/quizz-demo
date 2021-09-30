import React, { useState } from 'react';
import { useSession } from 'next-auth/client';
import { Alert, Container, CustomInput } from 'reactstrap';
import { EditorState, convertToRaw } from 'draft-js';
import axios from 'axios';
import EmailEditor from '../EmailEditor/EmailEditor';
import styles from './sendleadsemail.module.scss';

const SendLeadsEmail = ({ toggle }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
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
          emailBody: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          emailSubject,
          test: isTest,
        };
        console.log(data, 'check');
        const resp = await axios.post('/api/sundae/accounts/waitlisters/sendLeadsEmail', data);
        setLoading(false);
        setEditorState(EditorState.createEmpty());
        setEmailSubject('');
        setSuccess(true);
        if (!isTest) {
          setTimeout(() => toggle(false), 2000);
        }
      } catch (e) {
        setLoading(false);
        setServerErrr('Something Went Wrong');
      }
    }
  };

  return (
    <div className={styles.notifications_container}>
      {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
      {isSuccess ? <Alert color="success">Email has been sent</Alert> : ''}
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
            onChange={() => {
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
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        {isSuccess ? <Alert color="success">Email has been sent</Alert> : ''}
      </div>
    </div>
  );
};

export default SendLeadsEmail;
