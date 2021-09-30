import React, { useEffect, useState } from 'react';
import Head from 'next/dist/next-server/lib/head';
import {Button, Col, Container, Row} from 'reactstrap';
import { useRouter } from 'next/router';
import Layout from '../../../Components/Layout/Layout';
import styles from './episodes/episodes.module.scss';

const SeriesId = () => {
  const router = useRouter();
  const { title } = router.query;
  const [seriesId, setSeriesId] = useState('');

  useEffect(() => {
    const seriesId = window.location.pathname.split('/')[2];
    setSeriesId(seriesId);
  }, []);

  return (
    <Layout>
      <Head>
        <title>Sundae - SeriesId</title>
      </Head>
      <div className={styles.episodes_container}>
          <Container>
              <Row>
                  <Col sm={12} md={3}>
                      <div className={styles.add_episodes_btn_container}>
                          <div
                              onClick={() => router.push(`/series/${seriesId}/episodes?series=${title}`)}
                              className={styles.add_episode_btn}
                          >
                          </div>
                          <p>Episode</p>
                      </div>
                  </Col>
                  <Col sm={12} md={3}>
                      <div className={styles.add_episodes_btn_container}>
                          <div
                              onClick={() => router.push(`/series/${seriesId}/quizzes`)}
                              className={styles.add_episode_btn}
                          >
                          </div>
                          <p>Quiz</p>
                      </div>
                  </Col>
              </Row>
          </Container>
      </div>
    </Layout>
  );
};

export default SeriesId;
