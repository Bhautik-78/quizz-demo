import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import Dropzone from 'react-dropzone';
import {
  Container, Row, Col, CustomInput, Alert
} from 'reactstrap';
import { EditorState, convertToRaw } from 'draft-js';
import axios from 'axios';
import Layout from '../../../../Components/Layout/Layout';

import { uploadToS3 } from '../../../../services/uploadMedia';
import styles from './episodes.module.scss';
import Head from 'next/head';

const AddEpisode = ({ seriesId }) => {
  const router = useRouter();
  const { series } = router.query;
  const [session, loading] = useSession();
  const [seriesName, setSeriesName] = useState('');
  const [name, setName] = useState('');
  const [epNo, setEpNo] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [isPublished, setPublished] = useState(false);
  const [isFree, setFree] = useState(false);
  const [pageType, setPageType] = useState('content');
  const [pdfFile, setPdfFile] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [htmlContent, setHtmlContent] = useState('');

  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);

  const [clientErr, setClientErr] = useState({
    name: '',
    epNo: '',
    coverImg: '',
    pdfFile:''
  });

  const setInitialErrors = () => {
    setClientErr({
      name: '',
      epNo: '',
      coverImg: '',
      pdfFile:''
    });
    setServerErr(null);
  };

  const doSetInitialState = () => {
    setName('');
    setEpNo('');
    setImgUrl('');
    setCoverImg('');
    setPublished(false);
    setFree(false);
    setServerErr(null);
    setHtmlContent('');
    setEditorState(EditorState.createEmpty());
  };
  useEffect(() => {
    setSeriesName(series);
  }, [series]);

  const doAddEpisode = async () => {
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
        let pdfUrl;
        if (pdfFile) {
          pdfUrl = await uploadToS3(pdfFile);
        }
        console.log(pdfUrl, 'episode 101');

        const data = {
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
        if (pageType === 'PDF') {
          data.episodeStyle = 'PDF';
        }
        console.log(data, 'just check 102');
        const response = await axios.post('/api/sundae/episode/add', data);
        const episodeId = JSON.parse(response.data.content);
        console.log(JSON.parse(response.data.content), 'checking102=========');

        let mediaUrls = null;
        if (pageType === 'PDF') {
          mediaUrls = [
            {
              srcUrl: pdfUrl,
              position:0,
              mediaType: 'PDF',
            },
          ];
        }
        const pageData = {
          episodeId: episodeId.id,
          pageNumber: 1,
          content: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          mediaUrls,
        };
        console.log(pageData, 'ssssssssssssspage======');
        const pageResponse = await axios.post('/api/sundae/page/add', pageData);
        console.log(pageResponse, 'final 10202');
        doSetInitialState();
        setLoading(false);
        router.push(
          `/series/${seriesId}/episodes/edit?episode=${episodeId.id}`
        );
        // router.push(`/series/${seriesId}/episodes?series=${series}`)
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
        <title>Sundae - Add Episode</title>
      </Head>
      <div className={styles.episodes_container}>
        {serverErr ? <Alert color="danger">{serverErr}</Alert> : ''}
        <Container>
          <h1>{seriesName}</h1>
          <hr />
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
                onChange={(e) => {
                  setInitialErrors();
                  console.log(e.target.value);
                  setFree(!isFree);
                }}
              />
            </div>
            {/* <div className='form-input-container'>
              <label>Page</label>

                htmlContent={htmlContent}
                setHtmlContent={setHtmlContent}
                editorState={editorState}
                setEditorState={setEditorState}
              />
            </div> */}
            <Row className="w-100">
              <Col sm={12} md={6}>
                <div className="form-input-container">
                  <label>Page Style</label>
                  <select
                    value={pageType}
                    onChange={(e) => setPageType(e.target.value)}
                    name="page"
                    id="page"
                  >
                    <option value="content">Text/Media</option>
                    <option value="PDF">PDF</option>
                  </select>
                </div>
              </Col>
              <Col sm={12} md={6}>
                {pageType === 'PDF' ? (
                  <div className="form-input-container">
                    <label>Upload</label>
                    <Dropzone
                      accept="application/pdf"
                      style={{ width: '100%' }}
                      onDrop={(acceptedFiles) => {
                        setInitialErrors();
                        setPdfFile(acceptedFiles[0]);
                        console.log(acceptedFiles[0], 'check');
                      }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section className="upload-file-container">
                          <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <img src="/Assets/image.png" />
                            <p>Upload File PDF</p>
                          </div>
                        </section>
                      )}
                    </Dropzone>
                    <small className="text-danger pl-2">
                      {clientErr.pdfFile ? clientErr.pdfFile : ''}
                    </small>
                    <small className="text-success font-weight-bold pl-2 mt-1">
                      {pdfFile ? pdfFile.name : ''}
                    </small>
                  </div>
                ) : (
                  ''
                )}
              </Col>
            </Row>
            <div className={styles.btn_container}>
              <button
                type="button"
                onClick={doAddEpisode}
                disabled={isLoading ? 'disabled' : ''}
                className="btn btn-dark btn-block"
              >
                {isLoading ? 'Loading...' : 'Add Episode'}
              </button>
            </div>
          </div>
        </Container>
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

export default AddEpisode;
