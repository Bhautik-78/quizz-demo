import React, { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import {
  Spinner, Alert,
  Row,
  Col
} from 'reactstrap';
import axios from 'axios';
import { uploadToS3 } from '../../services/uploadMedia';
import styles from './UserSettings.module.scss';

const emailValidate = require('email-validator');

const UserSettings = ({ sundaeUser }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(null);
  const [emailDisabled, setEmailDisabled] = useState(true);
  const [imgUrl, setImgUrl] = useState('');
  const [dpImg, setDpImg] = useState(null);

  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [serverSuccess, setServerSuccess] = useState(null);
  const [clientErr, setClientErr] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const setInitialErrors = () => {
    setClientErr({
      firstName: '',
      lastName: '',
      email: ''
    });
    setServerErr(null);
  };

  const doEditUserSettings = async () => {
    const errorsCopy = { ...clientErr };
    setInitialErrors();
    let isError = false;
    console.log(firstName, lastName);
    if (!firstName.trim()) {
      errorsCopy.firstName = 'First Name is Required';
      isError = true;
    }

    if (!lastName.trim()) {
      errorsCopy.lastName = 'Last Name is Required';
      isError = true;
    }

    if (!email.trim()) {
      errorsCopy.email = 'Email is Required';
      isError = true;
    } else if (!emailValidate.validate(email)) {
      errorsCopy.email = 'Email is Invalid';
      isError = true;
    }

    if (isError) {
      setClientErr({ ...errorsCopy });
    } else {
      setLoading(true);
      try {
        let imageUrl = imgUrl;
        if (dpImg) {
          const uploadedImg = await uploadToS3(dpImg);
          imageUrl = uploadedImg;
        }

        const data = {
          firstName,
          lastName,
          email,
          imageUrl
        };

        const resp = await axios.post('/api/sundae/accounts/updateUser', data);
        if (!resp.errorMessage) {
          setServerSuccess('Updated sucessfully!');
        } else {
          setServerErr('Updated failed! Try again');
        }
      } catch (e) {
        console.error(e);
        setServerErr('Update failed! Try aain');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (sundaeUser) {
      setLoading(true);
      setFirstName(sundaeUser.firstName || '');
      setLastName(sundaeUser.lastName || '');
      setEmail(sundaeUser.email || '');
      setEmailDisabled(sundaeUser.email ? 'disabled' : false);
      setImgUrl(sundaeUser.imageUrl);
      setLoading(false);
    }
  }, [sundaeUser]);

  if (isLoading) {
    return <Spinner style={{ width: '3rem', height: '3rem' }} />;
  }
  return (
    <div className={styles.usersettings_container}>
      {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
      {serverSuccess ? <Alert color="success">{serverSuccess}</Alert> : ''}
      <h1>
        User Settings
      </h1>
      <hr />
      <div className={styles.edit_user_settings_container}>
        <div className="form-input-container">
          <label>First Name</label>
          <input
            type="text"
            placeholder="Enter First Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
          />
        </div>
        <div className="form-input-container">
          <label>Last Name</label>
          <input
            type="text"
            placeholder="Enter Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
            }}
          />
        </div>
        <div className="form-input-container">
          <label>Email</label>
          <input
            type="text"
            placeholder="Enter Email"
            value={email || ''}
            disabled={emailDisabled}
            onChange={(e) => {
              setEmail(e.target.value.trim());
            }}
          />
        </div>
        <div className="form-input-container">
          <label>Display Picture</label>
          <Row className="w-100">
            <Col sm={12} md={7}>
              <Dropzone
                accept="image/*"
                style={{ width: '100%' }}
                onDrop={(acceptedFiles) => {
                  console.log(acceptedFiles);
                  setInitialErrors();
                  if (acceptedFiles && acceptedFiles.length < 1) {
                    setServerErr('Unsupported image -- Must be one of JPG/JPEG/PNG/SVG/GIF format!');
                  } else {
                    setImgUrl(URL.createObjectURL(acceptedFiles[0]));
                    setDpImg(acceptedFiles[0]);
                  }
                }}
              >
                {({ getRootProps, getInputProps }) => (
                  <section className="upload-file-container">
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <img src="/Assets/image.png" />
                      <p>Upload File JPG/JPEG/PNG/SVG/GIF</p>
                    </div>
                  </section>
                )}
              </Dropzone>
              <small className="text-danger pl-2">
                {clientErr.coverImg ? clientErr.coverImg : ''}
              </small>
            </Col>
            <Col sm={12} md={5}>
              <div className="preview-container">
                {imgUrl ? <img src={imgUrl} alt="display pic" /> : ''}
              </div>
            </Col>
          </Row>
        </div>
        <div className={styles.btn_container}>
          <button
            type="button"
            onClick={doEditUserSettings}
            disabled={isLoading ? 'disabled' : ''}
            className="btn btn-dark btn-block"
          >
            {isLoading ? 'Updating...' : 'Update User Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
