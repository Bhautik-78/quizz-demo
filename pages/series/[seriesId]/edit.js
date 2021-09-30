import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import {
  Container,
  Row,
  Col,
  CustomInput,
  Alert
} from 'reactstrap';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import Head from 'next/head';
import Layout from '../../../Components/Layout/Layout';
import { uploadToS3 } from '../../../services/uploadMedia';
import styles from './series.module.scss';

const SeriesEdit = ({ seriesId }) => {
  const router = useRouter();
  const [session, loading] = useSession();
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

  const setInitialErrors = () => {
    setClientErr({
      name: '',
      coverImg: '',
    });
    setServerErr(null);
  };

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/sundae/series/${seriesId}`);
        console.log(JSON.parse(response.data.content), 'fetched data success');
        const seriesContent = JSON.parse(response.data.content);
        setName(seriesContent.title);
        setPublished(seriesContent.isPublished);
        setImgUrl(seriesContent.media[0].srcUrl);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    };
    fetchSeries();
  }, [session]);

  const doEditSeries = async () => {
    const errorsCopy = { ...clientErr };
    let isError = false;
    if (!name.trim()) {
      errorsCopy.name = 'Name is Required';
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
          id: seriesId,
          title: name,
          shortDescription:'',
          isPublished,
          mediaUrls: [
            {
              srcUrl: imageUrl,
              position: 1,
              mediaType: 'IMAGE',
            },
          ],
        };

        await axios.post('/api/sundae/series/edit', data);
        router.push(`/series/${seriesId}/episodes?series=${name}`);
        setLoading(false);
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
        <title>
          Sundae - Series Edit
          {` - ${name}`}
        </title>
      </Head>
      <div className={styles.episodes_container}>
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
          />
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
            <div className={styles.btn_container}>
              <button
                type="button"
                onClick={doEditSeries}
                disabled={isLoading ? 'disabled' : ''}
                className="btn btn-dark btn-block"
              >
                {isLoading ? 'Loading...' : 'Update Series'}
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

export default SeriesEdit;
