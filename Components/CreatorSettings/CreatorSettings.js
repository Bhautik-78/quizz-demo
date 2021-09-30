/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import {
  Spinner,
  Alert,
  Row,
  Col,
  Modal,
  ModalBody
} from 'reactstrap';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import { useRouter } from 'next/router';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { uploadToS3 } from '../../services/uploadMedia';
import styles from './CreatorSettings.module.scss';

const fillTemplate = require('es6-dynamic-template');

const isDomainValid = require('is-valid-domain');

// eslint-disable-next-line no-template-curly-in-string
const WEBAPPURL = 'https://${handle}.getsundae.com';
const CreatorSettings = ({ sundaeUser }) => {
  const router = useRouter();
  const [creator, setCreator] = useState(null);
  const [becomeCreator, setBecomeCreator] = useState(false);

  const [creatorTitle, setCreatorTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [oldHandle, setOldHandle] = useState('');
  const [creatorDescription, setCreatorDescription] = useState('');
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [creatorTagline, setCreatorTagline] = useState('');
  const [taglineCount, setTaglineCount] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [portraitImage, setPortraitImg] = useState(null);
  const [landscape_imageUrl, setLandscapeImageUrl] = useState('');
  const [landscapeImage, setLandscapeImg] = useState(null);
  const [price, setPrice] = useState('2.99');
  const [creatorLink, setCreatorLink] = useState(WEBAPPURL);
  const [linkCopied, setLinkCopied] = useState(false);

  const [isPaymentConfigOpen, setPaymentConfigModalOpen] = useState(false);

  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [clientErr, setClientErr] = useState({
    creatorTitle: '',
    handle: '',
    creatorDescription: '',
    creatorTagline: '',
    portraitImage: '',
    landscapeImage: '',
    price: ''
  });

  const setInitialErrors = () => {
    setClientErr({
      creatorTitle: '',
      handle: '',
      creatorDescription: '',
      creatorTagline: '',
      portraitImage: '',
      landscapeImage: '',
      price: ''
    });
    setServerErr(null);
  };

  const doAddEditCreatorSettings = async () => {
    const errorsCopy = { ...clientErr };
    setInitialErrors();
    let isError = false;
    if (!creatorTitle.trim()) {
      errorsCopy.creatorTitle = 'Your Title is Required';
      isError = true;
    }

    if (!handle.trim()) {
      errorsCopy.handle = 'Your Sundae handle is required';
      isError = true;
    } else if (!isDomainValid(creatorLink.split('://')[1])) {
      errorsCopy.handle = 'Handle contains characters that are not permissible in a URL';
      isError = true;
    } else if (oldHandle !== handle) {
      const handleResp = await axios.post('/api/sundae/accounts/userByHandle', {
        handle
      });
      if (handleResp.data.errorMessage) {
        console.error(handleResp.data.errorMessage);
        setServerErr(handleResp.data.errorMessage);
      } else if (handleResp.data.user) {
        errorsCopy.handle = 'Handle already exists! Try another one';
        isError = true;
      }
    }

    if (!creatorDescription.trim()) {
      errorsCopy.creatorDescription = 'Description is Required';
      isError = true;
    } else if (creatorDescription.length > 191) {
      errorsCopy.creatorDescription = 'Description cannot be more than 191 characters';
      isError = true;
    }

    if (!creatorTagline.trim()) {
      errorsCopy.creatorTagline = 'Your Tagline is Required';
      isError = true;
    } else if (creatorTagline.length > 40) {
      errorsCopy.creatorTagline = 'Your Tagline cannot be more than 40 characters';
      isError = true;
    }

    if (!price.trim()) {
      errorsCopy.price = 'Price is required';
      isError = true;
    } else if (parseFloat(price) <= 2.98) {
      errorsCopy.price = 'Price cannot be less than $2.99';
      isError = true;
    }

    if (isError) {
      setClientErr({ ...errorsCopy });
    } else {
      setLoading(true);
      try {
        let finalPortraitUrl = '';
        let finalLandscapeUrl = '';
        if (portraitImage) {
          const uploadedImg = await uploadToS3(portraitImage);
          setImageUrl(uploadedImg);
          setPortraitImg(null);
          finalPortraitUrl = uploadedImg;
        } else {
          finalPortraitUrl = imageUrl;
        }

        if (landscapeImage) {
          const uploadedImg = await uploadToS3(landscapeImage);
          setLandscapeImageUrl(uploadedImg);
          setLandscapeImg(null);
          finalLandscapeUrl = uploadedImg;
        } else {
          finalLandscapeUrl = landscape_imageUrl;
        }
        console.log(imageUrl, landscape_imageUrl);
        const data = {
          creatorTitle,
          creatorDescription,
          creatorTagline,
          imageUrl: finalPortraitUrl,
          landscape_imageUrl: finalLandscapeUrl,
          price
        };
        let resp;
        if (creator) {
          resp = await axios.post('/api/sundae/accounts/creators/updateCreator', data);
        } else {
          resp = await axios.post('/api/sundae/accounts/creators/creatorApplication', data);
        }
        if (sundaeUser.handle !== handle) {
          const userUpResp = await axios.post(
            '/api/sundae/accounts/updateUser',
            {
              handle
            }
          );
          if (userUpResp.data.errorMessage) {
            console.error(resp.data.errorMessage);
            setServerErr(userUpResp.data.errorMessage);
          }
        }
        if (resp.data.errorMessage) {
          setServerErr(resp.data.errorMessage);
        } else if (!creator) {
          router.reload();
        }
      } catch (e) {
        console.error(e);
        setServerErr(e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (sundaeUser) {
      setLoading(true);
      if (sundaeUser.creator) {
        const getCreator = async () => {
          const resp = await axios.get(`/api/sundae/accounts/creators/${sundaeUser.creator.id}`);
          if (resp.data.errorMessage) {
            setServerErr(resp.data.errorMessage);
          } else {
            setCreator(resp.data.creator);
          }
        };
        getCreator();
      }
      setHandle(sundaeUser.handle || '');
      setOldHandle(sundaeUser.handle || '');
      setCreatorLink(fillTemplate(WEBAPPURL, { handle: sundaeUser.handle }));
      setLoading(false);
    }
  }, [sundaeUser]);

  useEffect(() => {
    if (creator) {
      console.log(creator);
      setCreatorTitle(creator.creatorTitle || '');
      setCreatorDescription(creator.creatorDescription || '');
      setDescriptionCount(creator.creatorDescription
        ? creator.creatorDescription.length : 0);
      setCreatorTagline(creator.creatorTagline || '');
      setTaglineCount(creator.creatorTagline
        ? creator.creatorTagline.length : 0);
      setPrice(creator.price);
      setImageUrl(creator.imageUrl);
      setLandscapeImageUrl(creator.landscape_imageUrl);

      const getStripeAccount = async () => {
        const response = await axios.get('/api/sundae/payments/getAccount');
        if (!response.data.errorMessage && !response.data.account) {
          setPaymentConfigModalOpen(true);
        }
      };
      getStripeAccount();
    }
  }, [creator]);

  if (isLoading) {
    return <Spinner style={{ width: '3rem', height: '3rem' }} />;
  }

  let creatorSettingsUI = null;
  if (!creator && !becomeCreator) {
    creatorSettingsUI = (
      <div>
        <p>
          Looks like you are not a creator. Creators can get paid for their content.
        </p>
        <button
          type="button"
          onClick={() => setBecomeCreator(true)}
          className="btn btn-dark btn-block"
        >
          Become a creator
        </button>
      </div>
    );
  } else {
    creatorSettingsUI = (
      <div>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        {creator
          ? (
            <div className="form-input-container">
              <label>Current Status</label>
              <Alert color={creator.applicationStatus !== 'APPROVED' ? 'warning' : 'success'}>
                {creator.applicationStatus}
              </Alert>
            </div>
          ) : null}
        <div className="form-input-container">
          <label>Your Title</label>
          <input
            type="text"
            placeholder="How do you want to be identified?"
            value={creatorTitle}
            onChange={(e) => {
              setInitialErrors();
              setCreatorTitle(e.target.value);
            }}
          />
          <small className="text-danger pl-2">
            {clientErr.creatorTitle}
          </small>
        </div>
        <div className="form-input-container">
          <label>Sundae Handle</label>
          <input
            type="text"
            placeholder="sundaecreator"
            value={handle}
            onChange={(e) => {
              setInitialErrors();
              let ehandle = e.target.value.toLocaleLowerCase();
              ehandle = ehandle.trim();
              setHandle(ehandle);
              const url = fillTemplate(WEBAPPURL, { handle: ehandle });
              if (!isDomainValid(url.split('://')[1])) {
                console.log(url);
                const errorsCopy = { ...clientErr };
                errorsCopy.handle = 'Handle contains characters that are not permissible in a URL';
                setClientErr(errorsCopy);
              }
              setCreatorLink(url);
            }}
          />
          <small className="text-danger pl-2">
            {clientErr.handle}
          </small>
        </div>
        {handle ? (
          <div className="form-input-container">
            <label>My Creator Link</label>
            <input
              type="text"
              disabled
              value={creatorLink}
            />
            <CopyToClipboard text={creatorLink} onCopy={() => setLinkCopied(true)}>
              <button type="button" className="btn btn-dark">{linkCopied ? 'Copied!' : 'Copy'}</button>
            </CopyToClipboard>
          </div>
        ) : '' }
        <div className="form-input-container">
          <label>
            Description
            {' '}
            {descriptionCount}
            /191
          </label>
          <textarea
            rows="3"
            maxLength="191"
            placeholder="Brief description about what you offer"
            value={creatorDescription}
            onChange={(e) => {
              setInitialErrors();
              setCreatorDescription(e.target.value);
              setDescriptionCount(e.target.value.length);
            }}
          />
          <small className="text-danger pl-2">
            {clientErr.creatorDescription}
          </small>
        </div>
        <div className="form-input-container">
          <label>
            Tagline
            {' '}
            {taglineCount}
            /40
          </label>
          <textarea
            rows="2"
            maxLength="40"
            placeholder="Your tagline"
            value={creatorTagline}
            onChange={(e) => {
              setInitialErrors();
              setCreatorTagline(e.target.value);
              setTaglineCount(e.target.value.length);
            }}
          />
          <small className="text-danger pl-2">
            {clientErr.creatorTagline}
          </small>
        </div>
        <div className="form-input-container">
          <label>Your Current Price (USD) $</label>
          <input
            type="number"
            min="2.99"
            step="any"
            placeholder="2.99"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
            }}
          />
          <small className="text-danger pl-2">
            {clientErr.price}
          </small>
        </div>
        <div className="form-input-container">
          <label>Payment Popup Image</label>
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
                    setImageUrl(URL.createObjectURL(acceptedFiles[0]));
                    setPortraitImg(acceptedFiles[0]);
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
                {clientErr.portraitImage ? clientErr.portraitImage : ''}
              </small>
            </Col>
            <Col sm={12} md={5}>
              <div className="preview-container">
                {imageUrl ? <img src={imageUrl} alt="portrait" /> : ''}
              </div>
            </Col>
          </Row>
        </div>
        <div className="form-input-container">
          <label>Creator Profile Image</label>
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
                    setLandscapeImageUrl(URL.createObjectURL(acceptedFiles[0]));
                    setLandscapeImg(acceptedFiles[0]);
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
                {clientErr.landscapeImage ? clientErr.landscapeImage : ''}
              </small>
            </Col>
            <Col sm={12} md={5}>
              <div className="preview-container">
                {landscape_imageUrl ? <img src={landscape_imageUrl} alt="landscape" /> : ''}
              </div>
            </Col>
          </Row>
        </div>
        <div className={styles.btn_container}>
          <button
            type="button"
            onClick={doAddEditCreatorSettings}
            disabled={isLoading ? 'disabled' : ''}
            className="btn btn-dark btn-block"
          >
            {isLoading ? 'Updating...' : 'Update Creator Settings'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.creatorsettings_container}>
      <h1>
        Creator Settings
        {' '}
        {creator ? (
          <button onClick={() => router.push('/payments')} type="button" className="btn btn-dark">Go to Payments</button>
        ) : ''}

      </h1>
      <hr />
      <div className={styles.creator_settings_inn_container}>
        {creatorSettingsUI}
      </div>
      <Modal
        centered
        isOpen={isPaymentConfigOpen}
      >
        <ModalBody>
          <p>In order to proceed, you MUST configure your Stripe Connect Account!</p>
          <button onClick={() => router.push('/payments')} type="button" className="btn btn-dark">Go to Payments</button>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default CreatorSettings;
