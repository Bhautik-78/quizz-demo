import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Col, CustomInput, Row
} from 'reactstrap';
import Dropzone from 'react-dropzone';
import styles from '../../pages/series/[seriesId]/episodes/episodes.module.scss';
import CardLoader from '../CardLoader';

const EditQuizzes = () => {
  const [Id, setId] = useState('');
  const [quizze, setQuizzes] = useState({});
  const [editQuizz, setEditQuizz] = useState({});
  const [serverErr, setServerErr] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [isPublished, setPublished] = useState(false);
  const [coverImg, setCoverImg] = useState('');
  const [clientErr, setClientErr] = useState({
    title: '',
    coverImg: '',
  });

  useEffect(() => {
    const id = window.location.pathname.split('/');
    const quizzId = id[4];
    setId(quizzId);

    const fetchQuizz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/sundae/quizzes/${quizzId}`);
        if (response.data.quiz) {
          setQuizzes(response.data.quiz);
          setEditQuizz({ title: response.data.quiz.title });
          setImgUrl(response.data.quiz.imageUrl);
          setPublished(response.data.quiz.isPublished);
        } else {
          setServerErr(response.data.errorMessage);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setServerErr('Some server Error');
      }
    };
    fetchQuizz();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditQuizz({ ...editQuizz, [name]: value });
  };

  const setInitialErrors = () => {
    setClientErr({
      title: '',
      coverImg: '',
    });
  };

  const onEdit = async () => {
    try {
      const data = {
        title: editQuizz.title,
        imageUrl: imgUrl,
        isPublished
      };
      setLoading(true);
      const response = await axios.post(`/api/sundae/quizzes/${Id}/edit`, data);
      if (response.data.quiz) {
        setLoading(false);
      } else {
        setServerErr(response.data.errorMessage);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setServerErr('Some server Error');
    }
  };

  return (
    <div className={styles.episodes_container}>
      {
                isLoading ? <CardLoader />
                  : (
                    <div>
                      <div className={styles.add_episode_container}>
                        <div className="form-input-container">
                          <label>Name</label>
                          <input
                            name="title"
                            type="text"
                            placeholder="Enter Title"
                            value={editQuizz && editQuizz.title}
                            onChange={handleChange}
                          />
                        </div>
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
                            setPublished(!isPublished);
                          }}
                        />
                      </div>
                      <div>
                        <button className="btn btn-dark" onClick={onEdit}>Edit Quiz</button>
                      </div>
                    </div>
                  )
            }
    </div>
  );
};

export default EditQuizzes;
