/* eslint-disable */
import React from 'react';
import { Row, Col } from 'reactstrap';
import styles from './landing.module.scss';

const FeaturesList = () => {
  return (
    <div className={styles.feature_list_container}>
      <div className={styles.content_container}>
        <div className={styles.title_container}>
          <h1>Step-by-step progress to your desired flexibility goals</h1>
        </div>
        <Row>
          <Col sm={12} md={4}>
            <div className={styles.feature_item_container}>
              <img src='/Assets/movementbydavid/01.png' />
              <h3>Weekly Movement Content</h3>
              <p>Dropping weekly pilates and stretching videos</p>
            </div>
          </Col>
          <Col sm={12} md={4}>
            <div className={styles.feature_item_container}>
              <img src='/Assets/movementbydavid/02.png' />
              <h3>Live Events</h3>
              <p>Hosting a monthly zoom community stretching and Q&A</p>
            </div>
          </Col>
          <Col sm={12} md={4}>
            <div className={styles.feature_item_container}>
              <img src='/Assets/movementbydavid/03.png' />
              <h3>Immersive Community</h3>
              <p>
                Instant access to the movement private community -- support is
                everything!
              </p>
            </div>
          </Col>
          <Col sm={12} md={4}>
            <div className={styles.feature_item_container}>
              <img src='/Assets/movementbydavid/04.png' />
              <h3>Weekly Check-Ins</h3>
              <p>Weekly reminders to stretch and stay accountable</p>
            </div>
          </Col>
          <Col sm={12} md={4}>
            <div className={styles.feature_item_container}>
              <img src='/Assets/movementbydavid/05.png' />
              <h3>Personalized Advice</h3>
              <p>
                Exclusively sharing methods & advice to get you closer to your
                stretching goals
              </p>
            </div>
          </Col>
          <Col sm={12} md={4}>
            <div className={styles.feature_item_container}>
              <img src='/Assets/movementbydavid/06.png' />
              <h3>Real Movement Support</h3>
              <p>On-going access to me via group chat and direct message</p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default FeaturesList;
