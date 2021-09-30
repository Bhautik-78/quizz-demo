import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import Head from 'next/dist/next-server/lib/head';
import {
  Alert, Col, Container, Modal, ModalBody, ModalHeader, Row, Spinner
} from 'reactstrap';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import Layout from '../../../../Components/Layout/Layout';
import styles from './quizzes.module.scss';
import { uploadToS3 } from '../../../../services/uploadMedia';
import QuizzCard from '../../../../Components/QuizzCard';
import CardLoader from '../../../../Components/CardLoader';

const Quizzes = () => {
  const router = useRouter();
  const [seriesId, setSeriesId] = useState('');
  const [session, loading] = useSession();
  const [isOpen, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [serverErr, setServerErr] = useState(null);
  const [clientErr, setClientErr] = useState({
    name: '',
    coverImg: '',
  });

  useEffect(() => {
    const seriesId = window.location.pathname.split('/')[2];
    setSeriesId(seriesId);
    const getAllQuizzes = async () => {
      try {
        setLoading(true);
        const data = {
          seriesId
        };
        const response = await axios.post('/api/sundae/quizzes', data);
        if (response.data.quizzes) {
          setQuizzes(response.data.quizzes);
        } else {
          setServerErr(response.data.errorMessage);
          router.push('/');
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setServerErr('Some server Error');
        router.push('/');
      }
    };
    getAllQuizzes();
  }, []);

  const setInitialErrors = () => {
    setClientErr({
      name: '',
      coverImg: '',
    });
    setServerErr(null);
  };

  const setInitialState = () => {
    setOpen(false);
    setQuiz('');
    setImgUrl('');
    setCoverImg('');
  };

  const doAddQuiz = async (item) => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!quiz) {
      errorsCopy.name = 'Name is Required';
      isError = true;
    }
    if (!coverImg) {
      errorsCopy.coverImg = 'Cover Image is Required';
      isError = true;
    }
    if (isError) {
      setClientErr({ ...errorsCopy });
    } else {
      setLoading(true);
      try {
        const imageUrl = await uploadToS3(coverImg);
        const data = {
          creatorId: session.user.sundaeUser.creator.id,
          seriesId,
          quizType: 'DEFAULT',
          title: quiz,
          imageUrl,
          isPublished: false,
        };
        const response = await axios.post('/api/sundae/quizzes/add', data);
        setLoading(false);
        console.log('response', response);
        router.push(`/series/${seriesId}/quizzes/${(response.data.quiz).id}/question`);
        setInitialState();
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
        <title>Sundae - Quizzes</title>
      </Head>
      <div className={styles.quizzes_container}>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        <Container>
          {
                                isLoading ? <CardLoader />
                                  : (
                                    <Row>
                                      <Col sm={12} md={3}>
                                        <div className={styles.add_quizzes_btn_container}>
                                          <div
                                            onClick={() => setOpen(true)}
                                            className={styles.add_quizzes_btn}
                                          >
                                            <img src="/Assets/add_icon.png" alt="addIcon" />
                                          </div>
                                          <p>Add Quiz</p>
                                        </div>
                                      </Col>
                                      {quizzes
                                        ? quizzes.map((item) => (
                                          <QuizzCard quizzes={item} />
                                        ))
                                        : ''}

                                    </Row>
                                  )
                            }
        </Container>
        <Modal
          className="custom-modal"
          centered
          isOpen={isOpen}
          toggle={() => setOpen(false)}
        >
          <ModalHeader
            className={styles.quizzes_modal_header}
            toggle={() => setOpen(false)}
          >
            Add Quizzes
          </ModalHeader>
          <ModalBody>
            <div className={styles.quizzes_form_container}>
              <div className="form-input-container">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter Quiz"
                  value={quiz}
                  onChange={(e) => {
                    setInitialErrors();
                    setQuiz(e.target.value);
                  }}
                />
                <small className="text-danger pl-2">
                  {clientErr.name ? clientErr.name : ''}
                </small>
              </div>
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
            <button
              type="button"
              onClick={(item) => doAddQuiz(item)}
              disabled={isLoading ? 'disabled' : ''}
              className="btn btn-dark btn-block"
            >
              {isLoading ? 'Loading...' : 'Add Quizzes'}
            </button>
          </ModalBody>
        </Modal>
      </div>
    </Layout>
  );
};

export default Quizzes;
