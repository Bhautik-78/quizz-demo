import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/client';
import Dropzone from 'react-dropzone';
import Head from 'next/head';
import {
  Container,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  CustomInput,
  Spinner,
  Alert
} from 'reactstrap';
import axios from 'axios';
import Layout from '../../Components/Layout/Layout';
import SeriesCard from '../../Components/SeriesCard/SeriesCard';
import { uploadToS3 } from '../../services/uploadMedia';
import styles from '../../styles/series.module.scss';

const Series = () => {
  const router = useRouter();
  const [session, loading] = useSession();
  const [series, setSeries] = useState(null);
  const [isOpen, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isPublished, setPublished] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [clientErr, setClientErr] = useState({
    name: '',
    coverImg: '',
  });

  useEffect(() => {
    console.log(session, 'yoooo');
    const getAllSiries = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/sundae/series');
        console.log(JSON.parse(response.data.content), 'fetched data success');
        if (JSON.parse(response.data.content)) {
          setSeries(JSON.parse(response.data.content));
        } else {
          setServerErr(JSON.parse(response.data.errorMessage));
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setServerErr('Some server Error');
      }
    };
    getAllSiries();
  }, [session]);

  const setInitialErrors = () => {
    setClientErr({
      name: '',
      coverImg: '',
    });
    setServerErr(null);
  };
  const setInitialState = () => {
    setOpen(false);
    setName('');
    setPublished(false);
    setImgUrl('');
    setCoverImg('');
  };

  const doAddSeries = async () => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!name) {
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
          title: name,
          shortDescription: '',
          isPublished,
          mediaUrls: [
            {
              srcUrl: imageUrl,
              position: 1,
              mediaType: 'IMAGE',
            },
          ],
        };
        const response = await axios.post('/api/sundae/series/add', data);
        setLoading(false);
        router.push(`/series/${JSON.parse(response.data.content).id}/episodes?series=${name}`);
        setInitialState();
      } catch (e) {
        console.log(e);
        setLoading(false);
        setServerErr('some server error');
      }
    }
  };

  if (loading) return null;

  if (!loading && !session) {
    router.push('/');
  }

  return (
    <Layout>
      <Head>
        <title>Sundae - Series - Home</title>
      </Head>
      <div className={styles.series_container}>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        <Container>
          <Row>
            <Col sm={12} md={3}>
              <div className={styles.add_series_btn_container}>
                <div
                  onClick={() => setOpen(true)}
                  className={styles.add_series_btn}
                >
                  <img src="/Assets/add_icon.png" />
                </div>
                <p>Add New Series</p>
              </div>
            </Col>
            {series
              ? series.edges.map((item, i) => {
                const { node } = item;
                const { media } = node;
                const [coverImage] = media;
                return (
                  <Col key={i} sm={12} md={3}>
                    <SeriesCard series={node} coverImage={coverImage} />
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
            className={styles.series_modal_header}
            toggle={() => setOpen(false)}
          >
            Add Series
          </ModalHeader>
          <ModalBody>
            <div className={styles.series_form_container}>
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
                <CustomInput
                  type="switch"
                  id="exampleCustomSwitch"
                  name="customSwitch"
                  label="Publish"
                  value={isPublished}
                  onChange={(e) => {
                    setInitialErrors();
                    console.log(e.target.value);
                    setPublished(!isPublished);
                  }}
                />
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
            <button
              type="button"
              onClick={doAddSeries}
              disabled={isLoading ? 'disabled' : ''}
              className="btn btn-dark btn-block"
            >
              {isLoading ? 'Loading...' : 'Add Series'}
            </button>
          </ModalBody>
        </Modal>
      </div>
    </Layout>
  );
};

export default Series;
