/* eslint-disable react/jsx-props-no-spreading */
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/client';
import Dropzone from 'react-dropzone';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import {
  Container,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  Spinner,
  Alert,
  CustomInput
} from 'reactstrap';
import axios from 'axios';
import EmailEditor from '../../Components/EmailEditor/EmailEditor';
import Layout from '../../Components/Layout/Layout';
import styles from './workshops.module.scss';
import WorkshopCard from '../../Components/WorkshopCard/WorkshopCard';
import { uploadToS3 } from '../../services/uploadMedia';

const Workshops = () => {
  const router = useRouter();
  const [session, loading] = useSession();
  const [workshops, setWorkshops] = useState(null);
  const [title, setTitle] = useState('');
  const [isPublished, setPublished] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [price, setPrice] = useState('2.99');
  const [isFree, setIsFree] = useState(false);
  const [coverImg, setCoverImg] = useState('');
  const [topDescription, setTopDescription] = useState('');
  const [bottomDescription, setBottomDescription] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [htmlContent, setHtmlContent] = useState('');

  const [isOpen, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [clientErr, setClientErr] = useState({
    title: '',
    coverImg: '',
    price: '',
    emailSubject: '',
    emailBody: '',
  });

  const setInitialErrors = () => {
    setClientErr({
      title: '',
      coverImg: '',
      price: '',
      emailSubject: '',
      emailBody: '',
    });
    setServerErr(null);
  };

  const setInitialState = () => {
    setOpen(false);
    setTitle('');
    setPublished(false);
    setIsFree(false);
    setTopDescription('');
    setBottomDescription('');
    setImgUrl('');
    setCoverImg('');
    setPrice('2.99');
    setEmailSubject('');
    setEditorState(EditorState.createEmpty());
    setHtmlContent('');
  };

  const addWorkshop = async () => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!title.trim()) {
      errorsCopy.title = 'Title is required';
      isError = true;
    }
    if (!coverImg) {
      errorsCopy.coverImg = 'Cover Image is Required';
      isError = true;
    }

    if (!price.trim()) {
      errorsCopy.price = 'Price is required';
      isError = true;
    } else if (parseFloat(price) <= 2.98) {
      errorsCopy.price = 'Price cannot be less than $2.99';
      isError = true;
    }

    if (!emailSubject.trim()) {
      errorsCopy.emailSubject = 'Subject is Required for the Welcome Email';
      isError = true;
    }
    if (!editorState.getCurrentContent().hasText()) {
      errorsCopy.emailBody = 'Body is Required for the Welcome Email';
      isError = true;
    }

    if (isError) {
      setClientErr({ ...errorsCopy });
    } else {
      setLoading(true);
      try {
        const imageUrl = await uploadToS3(coverImg);
        const data = {
          title,
          topDescription,
          bottomDescription,
          isPublished,
          price,
          isFree,
          welcomeEmail: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          welcomeEmailSubject: emailSubject,
          mediaUrls: [
            {
              srcUrl: imageUrl,
              position: 1,
              mediaType: 'IMAGE',
            },
          ],
        };
        const resp = await axios.post('/api/sundae/workshop/add', data);
        if (resp.data.errorMessage) {
          setServerErr(resp.data.errorMessage);
        } else {
          const { workshop } = resp.data;
          console.log(workshop, 'after add');
          router.push(`/workshops/${workshop.id}/edit`);
          setInitialState();
        }
      } catch (e) {
        console.error(e);
        setServerErr(e.toString());
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (session) {
      const getCreatorWorkshops = async () => {
        try {
          setLoading(true);
          const resp = await axios.get('/api/sundae/workshop');
          console.log(resp.data, 'alll');
          if (resp.data.errorMessage) {
            setServerErr(resp.data.errorMessage);
          } else {
            setWorkshops(resp.data.workshops);
          }
        } catch (e) {
          setServerErr(e.toString());
        } finally {
          setLoading(false);
        }
      };
      getCreatorWorkshops();
    }
  }, [session]);

  if (loading) return null;

  if (!loading && !session) {
    router.push('/');
  }

  return (
    <Layout>
      <div className={styles.workshops_container}>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        <Container>
          <Row>
            <Col sm={12} md={4}>
              <div className={styles.add_workshop_btn_container}>
                <div
                  onClick={() => setOpen(true)}
                  className={styles.add_workshop_btn}
                  aria-hidden="true"
                >
                  <img src="/Assets/add_icon.png" alt="Add Workshop" />
                </div>
                <p>Add New Workshop</p>
              </div>
            </Col>
            {workshops
              ? workshops.map((item) => {
                const { media } = item;
                const [coverImage] = media;
                return (
                  <Col key={item.id} sm={12} md={3}>
                    <WorkshopCard workshop={item} coverImage={coverImage} />
                  </Col>
                );
              })
              : ''}
            {isLoading ? (
              <Spinner style={{ width: '3rem', height: '3rem' }} />
            ) : (
              ''
            )}
          </Row>
        </Container>
        <Modal
          className="custom-modal"
          centered
          isOpen={isOpen}
          toggle={() => setOpen(false)}
        >
          <ModalHeader
            className={styles.workshop_modal_header}
            toggle={() => setOpen(false)}
          >
            Add Workshop
          </ModalHeader>
          <ModalBody>
            <div className={styles.workshop_form_container}>
              <div className="form-input-container">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Enter the workshop title"
                  value={title}
                  onChange={(e) => {
                    setInitialErrors();
                    setTitle(e.target.value);
                  }}
                />
                <small className="text-danger pl-2">
                  {clientErr.title ? clientErr.title : ''}
                </small>
              </div>
              {!isFree ? (
                <div className="form-input-container">
                  <label>Your Current Price (USD) $</label>
                  <input
                    type="number"
                    min="2.99"
                    step="any"
                    placeholder="2.99"
                    value={price}
                    required
                    onChange={(e) => {
                      setPrice(e.target.value);
                    }}
                  />
                  <small className="text-danger pl-2">
                    {clientErr.price}
                  </small>
                </div>
              ) : null }

              <div className="form-input-container">
                <CustomInput
                  type="switch"
                  id="freeSwitch"
                  name="freeSwitch"
                  label="Make it free"
                  value={isFree}
                  onChange={() => {
                    setInitialErrors();
                    setIsFree(!isFree);
                  }}
                />
              </div>
              <div className="form-input-container">
                <CustomInput
                  type="switch"
                  id="publishedSwitch"
                  name="publishSwitch"
                  label="Publish"
                  value={isPublished}
                  onChange={() => {
                    setInitialErrors();
                    setPublished(!isPublished);
                  }}
                />
              </div>
              <div className="form-input-container">
                <label>
                  Primary Description
                  { ' -- ' }
                  {topDescription.length}
                  /575
                </label>
                <textarea
                  rows="3"
                  maxLength={575}
                  placeholder="Enter description that you want your audience to see first"
                  value={topDescription}
                  onChange={(e) => {
                    setInitialErrors();
                    setTopDescription(e.target.value);
                  }}
                />
              </div>
              <div className="form-input-container">
                <label>Secondary Description</label>
                <textarea
                  rows="3"
                  placeholder="Enter a footer description that you want your users to see at the end of viewing all the sessions"
                  value={bottomDescription}
                  onChange={(e) => {
                    setInitialErrors();
                    setBottomDescription(e.target.value);
                  }}
                />
              </div>
              <div className="form-input-container">
                <label>Cover Image</label>
                <Row>
                  <Col sm={12} md={7}>
                    <Dropzone
                      accept="image/*"
                      style={{ width: '100%' }}
                      onDrop={(acceptedFiles) => {
                        setInitialErrors();
                        if (acceptedFiles && acceptedFiles.length < 1) {
                          setServerErr('Unsupported image -- Must be one of JPG/JPEG/PNG/SVG/GIF format!');
                        } else {
                          setImgUrl(URL.createObjectURL(acceptedFiles[0]));
                          setCoverImg(acceptedFiles[0]);
                        }
                      }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section className="upload-file-container">
                          <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <img src="/Assets/image.png" alt="Cover" />
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
                      {imgUrl ? <img src={imgUrl} alt="Workshop" /> : ''}
                    </div>
                  </Col>
                </Row>
              </div>
              <div className="form-input-container">
                <label>Welcome Email Subject</label>
                <input
                  type="text"
                  placeholder="Welcome to your workshop!"
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
                <label>Welcome Email Body</label>
                <EmailEditor
                  htmlContent={htmlContent}
                  setHtmlContent={setHtmlContent}
                  editorState={editorState}
                  setEditorState={setEditorState}
                  placeholder="A welcome email to your workshop audience when they register to it. You should include any instructions in this email"
                />
                <small className="text-danger pl-2">
                  {clientErr.emailBody ? clientErr.emailBody : ''}
                </small>
              </div>
              <button
                type="button"
                onClick={addWorkshop}
                disabled={isLoading ? 'disabled' : ''}
                className="btn btn-dark btn-block"
              >
                {isLoading ? 'Creating...' : 'Add Workshop'}
              </button>
            </div>
          </ModalBody>
        </Modal>

      </div>
    </Layout>
  );
};

export default Workshops;
