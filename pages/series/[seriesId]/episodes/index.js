import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';

import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import axios from 'axios';
import Layout from '../../../../Components/Layout/Layout';
import EpisodeCard from '../../../../Components/EpisodeCard/EpisodeCard';
import styles from './episodes.module.scss';
import Head from 'next/head';

const Episodes = ({ seriesId }) => {
  const router = useRouter();
  const { series } = router.query;
  const [session, loading] = useSession();
  const [seriesName, setSeriesName] = useState('');
  const [episodes, setEpisodes] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteSeries = async () => {
    setIsDeleting(true);
    const deleteResp = await axios.post(`/api/sundae/series/${seriesId}/delete`);
    setIsDeleting(false);
    toggleDeleteModal();
    if (deleteResp.data.errorMessage) {
      setServerErr(deleteResp.data.errorMessage);
    } else {
      router.push('/series');
    }
  };
  const toggleDeleteModal = () => setDeleteModal(!deleteModal);
  useEffect(() => {
    console.log(seriesId, 'yo');
    setSeriesName(series);
    const getAllEpisodes = async () => {
      console.log('chala');
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/sundae/series/${seriesId}/episodes`
        );
        // console.log(JSON.parse(response.data.content), 'fetched data success');
        if (JSON.parse(response.data.content)) {
          setEpisodes(JSON.parse(response.data.content));
        } else {
          setServerErr(JSON.parse(response.data.errorMessage));
        }
        setLoading(false);
      } catch (e) {
        console.log(e, 'teuuu');
        setLoading(false);
        setServerErr('Some server Error');
      }
    };
    getAllEpisodes();
  }, [session]);

  if (loading) return null;

  if (!loading && !session) {
    router.push('/');
  }

  return (
    <Layout>
      <Head>
        <title>Sundae - Episodes</title>
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
            <Button disabled={isDeleting} color="danger" onClick={deleteSeries}>Delete</Button>
            {' '}
            <Button disabled={isDeleting} color="secondary" onClick={toggleDeleteModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
        <Container>
          <h1>
            {seriesName}
            {' '}
            <img onClick={() => router.push(`/series/${seriesId}/edit`)} src="/Assets/eidt.svg" alt="edit"/>
            {' '}
            <Button color="danger" onClick={toggleDeleteModal}>Delete</Button>
          </h1>
          <hr />
          <Row>
            <Col sm={12} md={3}>
              <div className={styles.add_episodes_btn_container}>
                <div
                  onClick={() => router.push(
                    `/series/${seriesId}/episodes/add?series=${seriesName}`
                  )}
                  className={styles.add_episode_btn}
                >
                  <img src="/Assets/add_icon.png" />
                </div>
                <p>Add New Episode</p>
              </div>
            </Col>
            {episodes
              ? episodes.edges.map((item, i) => {
                const { node } = item;
                const { media } = node;
                const [coverImage] = media;
                return (
                  <Col key={i} sm={12} md={3}>
                    <EpisodeCard
                      seriesId={seriesId}
                      episode={node}
                      coverImage={coverImage}
                      seriesName={seriesName}
                    />
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

export default Episodes;
