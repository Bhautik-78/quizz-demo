import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { useSession } from 'next-auth/client';
import Dropzone from 'react-dropzone';
import {
  Container,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  CustomInput,
  Alert,
  Button
} from 'reactstrap';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import axios from 'axios';
import Head from 'next/head';
import Layout from '../../../../Components/Layout/Layout';
import EditorPage from '../../../../Components/EditorPage/EditorPage';
import PdfPage from '../../../../Components/PdfPage/PdfPage';
import { uploadToS3 } from '../../../../services/uploadMedia';
import styles from './episodes.module.scss';

const EditEpisode = ({ seriesId }) => {
  const router = useRouter();
  const { episode, series } = router.query;
  const [session, loading] = useSession();
  const [updateModal, setUpdateModal] = useState(false);
  const [name, setName] = useState('');
  const [epNo, setEpNo] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [isPublished, setPublished] = useState(false);
  const [isFree, setFree] = useState(false);
  const [episodeId, setEpisodeId] = useState('');
  const [pageId, setPageId] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [oldEditorState, setOldEditorState] = useState(null);
  const [isPdf, setPdf] = useState(false);
  const [isEditable, setEditable] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(false);

  const [flag, setFlag] = useState(false);

  const [isLoading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [clientErr, setClientErr] = useState({
    name: '',
    epNo: '',
    coverImg: '',
  });

  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const setInitialErrors = () => {
    setClientErr({
      name: '',
      epNo: '',
      coverImg: '',
    });
  };

  const deleteEpisode = async () => {
    setIsDeleting(true);
    const deleteResp = await axios.post(`/api/sundae/episode/${episode}/delete`);
    setIsDeleting(false);
    toggleDeleteModal();
    if (deleteResp.data.errorMessage) {
      setServerErr(deleteResp.data.errorMessage);
    } else {
      router.push(`/series/${seriesId}/episodes?series=${series}`);
    }
  };

  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  const fetchEpisode = async () => {
    try {
      const response = await axios.get(`/api/sundae/episode/${episode}`);
      console.log(JSON.parse(response.data.content), 'fetched data success');
      const episodeContent = JSON.parse(response.data.content);
      setName(episodeContent.title);
      setEpNo(episodeContent.episodeNumber);
      setImgUrl(episodeContent.media[0].srcUrl);
      setPublished(episodeContent.isPublished);
      setFree(episodeContent.isFree);
      setEpisodeId(episodeContent.id);
      setEditable(episodeContent.isEditable);
      if (episodeContent.pages.length) {
        setPageId(episodeContent.pages[0].id);
        console.log(JSON.parse(episodeContent.pages[0].content));
        const convertedState = convertFromRaw(
          JSON.parse(episodeContent.pages[0].content)
        );
        console.log(convertedState, 'con');
        setEditorState(EditorState.createWithContent(convertedState));
      }
      if (episodeContent.style === 'PDF') {
        console.log(
          episodeContent.pages[0].media[0].srcUrl,
          '===============aaaaaaaaaaa========='
        );
        setPdf(true);
        setPdfUrl(episodeContent.pages[0].media[0].srcUrl);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const pageUpdate = async () => {
    try {
      if (pageId && isEditable && (oldEditorState !== editorState)) {
        setPageLoading(true);
        setOldEditorState(editorState);
        const pageData = {
          id: pageId,
          episodeId: episode,
          pageNumber: 1,
          content: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          mediaUrls: null,
        };
        console.log(pageData, '==============1============');
        await axios.post('/api/sundae/page/edit', pageData);
        const updateedDate = moment().format('LT');
        setLastUpdated(updateedDate);
        // console.log(updateedDate ,"dat");
        // console.log(typeof updateedDate ,"dat type");
        setPageLoading(false);
      }
    } catch (e) {
      setPageLoading(false);
      console.log(e);
    }
  };
  const pageUpdateWithPdf = async (file) => {
    try {
      setPageLoading(true);
      const uploadedUrl = await uploadToS3(file);
      const pageData = {
        id: pageId,
        episodeId: episode,
        pageNumber: 1,
        content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
        mediaUrls: [
          {
            srcUrl: uploadedUrl,
            position: 0,
            mediaType: 'PDF',
          },
        ],
      };
      console.log(pageData, '==============1============');
      const pageResponse = await axios.post('/api/sundae/page/edit', pageData);
      console.log(pageResponse, 'final==================');
      setPdfUrl(uploadedUrl);
      setPageLoading(false);
    } catch (e) {
      setPageLoading(false);
      console.log(e);
    }
  };
  useEffect(() => {
    if (!pageId) {
      fetchEpisode();
    }
    pageUpdate();
    const interval = setInterval(() => {
      if (!isPdf) {
        setFlag(!flag);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [flag]);

  if (loading) return null;

  if (!loading && !session) {
    router.push('/');
  }

  const doEditEpisode = async () => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!name.trim()) {
      errorsCopy.name = 'Name is Required';
      isError = true;
    }
    if (!epNo) {
      errorsCopy.epNo = 'Episode No is Required';
      isError = true;
    }
    if (!coverImg && !imgUrl) {
      errorsCopy.coverImg = 'Cover Image is Required';
      isError = true;
    }
    if (isError) {
      setClientErr({ ...errorsCopy });
    } else {
      setLoading(true);
      try {
        let imageUrl;
        if (coverImg) {
          const uploadedImg = await uploadToS3(coverImg);
          imageUrl = uploadedImg;
        } else {
          imageUrl = imgUrl;
        }
        const data = {
          id: episodeId,
          seriesId,
          title: name,
          synopsis: '',
          isPublished,
          isFree,
          episodeNumber: epNo,
          mediaUrls: [
            {
              srcUrl: imageUrl,
              position: 1,
              mediaType: 'IMAGE',
            },
          ],
        };
        console.log(data, 'just check 102');
        const response = await axios.post('/api/sundae/episode/edit', data);
        const epId = JSON.parse(response.data.content);
        console.log(JSON.parse(response.data.content), 'final response');
        const pageData = {
          id: pageId,
          episodeId: epId.id,
          pageNumber: 1,
          content: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          mediaUrls: null,
        };
        if (isEditable) {
          const pageResponse = await axios.post('/api/sundae/page/edit', pageData);
        } else {
          console.log('Page is not editable');
        }

        setLoading(false);
        setUpdateModal(true);
        setFlag(!flag);
      } catch (e) {
        console.log(e);
        setLoading(false);
        setServerErr('some server error');
      }
    }
  };

  return (
    <Layout>
      <Head>
        <title>
          Sundae - Episode Edit
          {` - ${name}`}
        </title>
      </Head>
      <div className={styles.episodes_container}>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        <Modal centered isOpen={deleteModal} toggle={toggleDeleteModal}>
          <ModalHeader toggle={toggleDeleteModal}>Delete Series</ModalHeader>
          <ModalBody>
            Are you sure? This cannot be undone.
            <br />
            { isDeleting
              ? <Spinner /> : ''}
          </ModalBody>
          <ModalFooter>
            <Button disabled={isDeleting} color="danger" onClick={deleteEpisode}>Delete</Button>
            {' '}
            <Button disabled={isDeleting} color="secondary" onClick={toggleDeleteModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
        <Container>
          <img
            onClick={(_event) => router.back()}
            style={{
              maxWidth: '20px',
              marginBottom: '1.5rem',
              cursor: 'pointer',
            }}
            alt="back"
            src="/Assets/arrow.png"
          />
          { ' ' }
          <Button color="danger" onClick={toggleDeleteModal} style={{ float: 'right' }}>Delete</Button>
          <div className={styles.add_episode_container}>
            <div className="form-input-container">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => {
                  setInitialErrors();
                  setName(e.target.value);
                }}
              />
              <small className="text-danger pl-2">
                {clientErr.name ? clientErr.name : ''}
              </small>
            </div>
            <div className="form-input-container">
              <label>Episode #</label>
              <input
                min={1}
                type="number"
                placeholder="Enter Episode No"
                value={epNo}
                onChange={(e) => {
                  setInitialErrors();
                  setEpNo(parseInt(e.target.value, 10));
                }}
              />
              <small className="text-danger pl-2">
                {clientErr.epNo ? clientErr.epNo : ''}
              </small>
            </div>
            <div className="form-input-container">
              <label>Cover Image</label>
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
                        setCoverImg(acceptedFiles[0]);
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
                    {imgUrl ? <img src={imgUrl} /> : ''}
                  </div>
                </Col>
              </Row>
            </div>
            <div className="form-input-container">
              <CustomInput
                type="switch"
                id="is_published"
                name="customSwitch"
                label="Publish"
                value={isPublished}
                checked={isPublished ? 'checked' : ''}
                onChange={(e) => {
                  setInitialErrors();
                  console.log(e.target.value);
                  setPublished(!isPublished);
                }}
              />
            </div>
            <div className="form-input-container">
              <CustomInput
                type="switch"
                id="is_free"
                name="customSwitch"
                label="Free"
                value={isFree}
                checked={isFree ? 'checked' : ''}
                onChange={(e) => {
                  setInitialErrors();
                  console.log(e.target.value);
                  setFree(!isFree);
                }}
              />
            </div>
            {isEditable && isPdf ? (
              <div className="form-input-container">
                <label>Page</label>
                <PdfPage
                  pageUpdateWithPdf={pageUpdateWithPdf}
                  pdfUrl={pdfUrl}
                  pageLoading={pageLoading}
                />
              </div>
            ) : (
              ''
            )}
            {isPdf || !isEditable ? (
              ''
            ) : (
              <div className="form-input-container">
                <label>Page</label>
                <EditorPage
                  htmlContent={htmlContent}
                  setHtmlContent={setHtmlContent}
                  editorState={editorState}
                  setEditorState={setEditorState}
                />
              </div>
            )}
            {isPdf || !isEditable ? (
              ''
            ) : (
              <Row>
                <Col sm={0} md={8}>
                  <Alert color="secondary">
                    <div className={styles.bottom_bar_container}>
                      <p>
                        Last Saved:
                        {lastUpdated}
                      </p>
                      <div className={styles.btns_container}>
                        <button
                          type="button"
                          onClick={pageUpdate}
                          disabled={pageLoading ? 'disabled' : ''}
                          className="btn btn-primary"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={doEditEpisode}
                          disabled={isLoading ? 'disabled' : ''}
                          className="btn btn-dark"
                        >
                          {isLoading ? 'Loading...' : 'Update Episode'}
                        </button>
                      </div>
                    </div>
                  </Alert>
                </Col>
              </Row>
            )}
            {!isEditable ? (
              <div className={styles.editable_error_content}>
                <div className="form-input-container">
                  <label>Page</label>
                  <p>The content for this episode cannot be edited</p>
                </div>
              </div>
            ) : (
              ''
            )}
            {isPdf || !isEditable ? (
              <div className={styles.btn_container}>
                <button
                  type="button"
                  onClick={doEditEpisode}
                  disabled={isLoading ? 'disabled' : ''}
                  className="btn btn-dark btn-block"
                >
                  {isLoading ? 'Loading...' : 'Update Episode'}
                </button>
              </div>
            ) : (
              ''
            )}
          </div>
        </Container>
        <Modal
          centered
          isOpen={updateModal}
          toggle={() => setUpdateModal(false)}
        >
          <ModalHeader toggle={() => setUpdateModal(false)} />
          <div className={styles.update_modal_container}>
            <div className={styles.img_container}>
              <img src="/Assets/tick.png" />
            </div>
            <h1>Updated the episode successfully</h1>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
export async function getServerSideProps({ params }) {
  //   console.log(params,"yo");
  return {
    props: {
      ...params,
    },
  };
}

export default EditEpisode;
