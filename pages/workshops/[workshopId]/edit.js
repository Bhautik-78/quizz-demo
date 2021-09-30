import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import {
  Container,
  Row,
  Col,
  CustomInput,
  Alert,
  Modal,
  Spinner,
} from 'reactstrap';
import Dropzone from 'react-dropzone';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import axios from 'axios';
import Head from 'next/head';
import Layout from '../../../Components/Layout/Layout';
import EmailEditor from '../../../Components/EmailEditor/EmailEditor';
import { uploadToS3 } from '../../../services/uploadMedia';
import { workshopThemes } from '../../../Utils/workshoptheme';
import styles from './workshopedit.module.scss';

const WorkshopEdit = ({ workshopId }) => {
  const router = useRouter();

  const [session, loading] = useSession();
  const [previewModal, setPreviewModal] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [isPublished, setPublished] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [topDescription, setTopDescription] = useState('');
  const [bottomDescription, setBottomDescription] = useState('');
  const [price, setPrice] = useState('2.99');

  const [emailSubject, setEmailSubject] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [htmlContent, setHtmlContent] = useState('');

  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [clientErr, setClientErr] = useState({
    title: '',
    coverImg: '',
    price: '',
    midDescription: '',
    emailSubject: '',
    emailBody: '',
  });

  const [midSection, setMidSection] = useState({
    title: '',
    description: '',
    image: '',
    bullets: [
      {
        text: 'You will achieve greatness!',
      },
    ],
  });

  const [pageStyles, setPageStyles] = useState();

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
    setTitle('');
    setPublished(false);
    setTopDescription('');
    setBottomDescription('');
    setImgUrl('');
    setCoverImg('');
    setPrice('');
    setIsFree(false);
    setEmailSubject('');
    setEditorState(EditorState.createEmpty());
    setHtmlContent('');
  };

  const getLandingByHandle = async (handle) => {
    try {
      const resp = await axios.post(
        '/api/sundae/accounts/creators/creatorByHandle',
        { handle }
      );
      console.log(resp, '............./////////.............');
      if (resp.status === 200 && resp?.data?.creator?.workshopLandingPageData) {
        const updatedData = JSON.parse(
          resp?.data?.creator?.workshopLandingPageData
        );
        console.log(updatedData, 'updated styles');
        setPageStyles({ ...updatedData });
      } else {
        const data = JSON.parse(localStorage.getItem('workshopLanding'));
        if (data) {
          setPageStyles(data?.pageStyles);
        } else {
          setPageStyles(workshopThemes[0]);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    const handle = session?.user?.sundaeUser?.handle;
    if (handle) {
      getLandingByHandle(handle);
    }
  }, [session]);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        setLoading(true);
        const resp = await axios.get(`/api/sundae/workshop/${workshopId}`);
        console.log(resp, '...............workshop....................');
        if (resp.data.errorMessage) {
          setServerErr(resp.data.errorMessage);
        } else {
          const { workshop } = resp.data;
          setTitle(workshop.title);
          setPublished(workshop.isPublished);
          setTopDescription(workshop.topDescription);
          setBottomDescription(workshop.bottomDescription);
          setImgUrl(workshop.media[0].srcUrl);
          setPrice(workshop.price);
          setIsFree(workshop.isFree);
          setHandle(workshop.handle);
          setEmailSubject(workshop.welcomeEmailSubject);
          if (workshop.welcomeEmail) {
            setEditorState(EditorState.createWithContent(
              convertFromRaw(JSON.parse(workshop.welcomeEmail))
            ));
            console.log(editorState);
          }

          if (workshop.webpageData) {
            setMidSection({ ...JSON.parse(workshop.webpageData) });
          }
        }
      } catch (err) {
        setServerErr(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshop();
  }, [workshopId]);

  const doSaveLocal = async () => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!title) {
      errorsCopy.title = 'Title is required';
      isError = true;
    }
    if (!coverImg && !imgUrl) {
      errorsCopy.coverImg = 'Cover Image is required';
      isError = true;
    }

    if (!price) {
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
        let imageUrl;
        if (coverImg) {
          imageUrl = await uploadToS3(coverImg);
        } else {
          imageUrl = imgUrl;
        }
        const data = {
          id: workshopId,
          title,
          topDescription,
          bottomDescription,
          isPublished,
          isFree,
          price,
          webpageData: midSection,
          mediaUrls: [
            {
              srcUrl: imageUrl,
              position: 1,
              mediaType: 'IMAGE',
            },
          ],
          pageStyles,
        };

        localStorage.setItem('workshopLanding', JSON.stringify(data));

        setLoading(false);

        setPreviewModal(true);
        setIframeLoading(true);
      } catch (e) {
        setServerErr(JSON.stringify(e));
      }
    }
  };

  const editWorkshop = async () => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!title) {
      errorsCopy.title = 'Title is required';
      isError = true;
    }
    if (!coverImg && !imgUrl) {
      errorsCopy.coverImg = 'Cover Image is required';
      isError = true;
    }

    if (!price) {
      errorsCopy.price = 'Price is required';
      isError = true;
    }
    if (!midSection.description) {
      errorsCopy.midDescription = 'Subheading is required';
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
        let imageUrl;
        if (coverImg) {
          imageUrl = await uploadToS3(coverImg);
        } else {
          imageUrl = imgUrl;
        }
        const data = {
          id: workshopId,
          title,
          topDescription,
          bottomDescription,
          isPublished,
          isFree,
          price,
          webpageData: JSON.stringify(midSection),
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

        const finalData = {
          id: session?.user?.sundaeUser?.creator?.id,
          workshopLandingPageData: JSON.stringify(pageStyles),
        };
        const resp = await axios.post('/api/sundae/workshop/edit', data);
        await axios.post(
          '/api/sundae/workshop/landing/edit',
          finalData
        );
        console.log(resp, 'final-update............');
        if (resp.data.errorMessage) {
          setServerErr(resp.data.errorMessage);
        } else {
          const { workshop } = resp.data;
          console.log(workshop, '.............a.............a');
          router.push(
            `/workshops/${workshop.id}/workshopsessions?title=${title}&handle=${workshop.handle}`
          );
          setInitialState();
        }
      } catch (e) {
        // console.error(e.respon);
        setServerErr(e.toString());
      } finally {
        setLoading(false);
      }
    }
  };

  const doAddlistItem = () => {
    const midSecCopy = { ...midSection };
    midSecCopy.bullets.push({
      text: '',
    });
    setMidSection({ ...midSecCopy });
  };
  const doRemlistItem = (idx) => {
    const midSecCopy = { ...midSection };
    const bulletsUpdated = midSecCopy.bullets.filter((item, i) => i !== idx);
    midSecCopy.bullets = bulletsUpdated;
    setMidSection({ ...midSecCopy });
  };

  const doChangeBullet = (e, i) => {
    const midSecCopy = { ...midSection };
    midSecCopy.bullets[i] = { ...midSecCopy.bullets[i], text: e.target.value };
    setMidSection({ ...midSecCopy });
  };

  if (loading) return null;

  if (!loading && !session) {
    router.push('/');
  }

  return (
    <Layout>
      <div className={styles.workshopedit_container}>
        <Head>
          <title>Sundae - Workshop - Edit</title>
        </Head>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        <Container>
          <img
            onClick={() => router.back()}
            style={{
              maxWidth: '20px',
              marginBottom: '1.5rem',
              cursor: 'pointer',
            }}
            src="/Assets/arrow.png"
            alt="Back"
          />
          <div className={styles.add_workshopedit_container}>
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
            <div className="form-input-container">
              <CustomInput
                type="switch"
                id="publishedSwitch"
                name="publishSwitch"
                label="Publish"
                value={isPublished}
                checked={isPublished ? 'checked' : ''}
                onChange={() => {
                  setInitialErrors();
                  setPublished(!isPublished);
                }}
              />
            </div>
            <div className="form-input-container">
              <CustomInput
                type="switch"
                id="freeSwitch"
                name="freeSwitch"
                label="Make it free"
                value={isFree}
                checked={isFree ? 'checked' : ''}
                onChange={() => {
                  setInitialErrors();
                  setIsFree(!isFree);
                }}
              />
            </div>
            {!isFree ? (
              <div className="form-input-container">
                <label>Workshop Price (USD) $</label>
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
                <small className="text-danger pl-2">{clientErr.price}</small>
              </div>
            ) : null }
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
                        setServerErr(
                          'Unsupported image -- Must be one of JPG/JPEG/PNG/SVG/GIF format!'
                        );
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
            <h2>Webpage Details</h2>
            <div className="form-input-container">
              <label>
                Heading
                {' -- '}
                {midSection.title.length}
                /68
              </label>
              <input
                maxLength={68}
                type="text"
                placeholder="Why join the workshop? A small heading."
                value={midSection.title}
                onChange={(e) => {
                  setMidSection({ ...midSection, title: e.target.value });
                }}
              />
            </div>
            <div className="form-input-container">
              <label>
                Sub Heading
                {' -- '}
                {midSection.description.length}
                /200
                {' '}
              </label>
              <textarea
                maxLength={200}
                rows="3"
                placeholder="Why join the workshop? A short description."
                value={midSection.description}
                onChange={(e) => {
                  setMidSection({ ...midSection, description: e.target.value });
                }}
              />
              <small className="text-danger pl-2">
                {clientErr.midDescription}
              </small>
            </div>
            {midSection.bullets.map((item, i) => (
              <div key={`${i}_bullet`} className="form-input-container">
                <label>
                  Workshop Achievement #
                  {i + 1}
                  {' -- '}
                  {item.text.length}
                  /68
                </label>
                <div className={styles.bullet_input}>
                  <input
                    maxLength={68}
                    type="text"
                    placeholder="What will they achieve if they take this workshop?"
                    value={item.text}
                    onChange={(e) => doChangeBullet(e, i)}
                  />
                  {i !== 0 ? (
                    <button
                      type="button"
                      onClick={() => doRemlistItem(i)}
                      className="btn btn-danger btn-sm"
                    >
                      x
                    </button>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            ))}
            <div className="w-100 d-flex align-items-center justify-content-end mb-3">
              {midSection.bullets.length === 5 ? (
                ''
              ) : (
                <button
                  type="button"
                  onClick={doAddlistItem}
                  className="btn btn-primary"
                >
                  + Add Achievement
                </button>
              )}
            </div>
            <h2>Workshop Styles</h2>
            {/* THEME SELECTION SECTION */}
            <section className={styles.theme_options_container}>
              {workshopThemes?.map((theme, i) => (
                <div
                  onClick={() => setPageStyles(theme)}
                  className={styles.theme_item}
                  key={`theme_${i}`}
                >
                  <img
                    className={
                        pageStyles?.id === theme.id ? styles.selected : ''
                      }
                    src={theme.themeIcon}
                    alt="Theme"
                  />
                  <p>{theme.themeName}</p>
                </div>
              ))}
            </section>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={editWorkshop}
                disabled={isLoading ? 'disabled' : ''}
                className="btn btn-dark btn-block m-2"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={doSaveLocal}
                disabled={isLoading ? 'disabled' : ''}
                className="btn btn-primary btn-block mt-0 m-2"
              >
                {isLoading ? 'Loading...' : 'Preview Page'}
              </button>
            </div>
          </div>
        </Container>
      </div>
      <Modal
        className="iframe-modal"
        centered
        isOpen={previewModal}
        toggle={() => setPreviewModal(false)}
      >
        {iframeLoading ? (
          <Spinner
            type="grow"
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
            }}
          />
        ) : null}
        <iframe
          loading="lazy"
          className={styles.iframe_container}
          onLoad={() => setIframeLoading(false)}
          src={`/creators/${session?.user?.sundaeUser?.handle}/workshops/${handle}?isPreview=true`}
          title={`Sundae - ${title}`}
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
        />
      </Modal>
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

export default WorkshopEdit;
