/* eslint-disable */
import React from 'react';
import { Row, Col } from 'reactstrap';
import styles from './landing.module.scss';

const HeroHeader = ({ setShowModal }) => {
  return (
    <div
      style={{ backgroundColor: '#F9FCFD' }}
      className={styles.top_header_container}
    >
      <Row className='flex-column-reverse flex-md-row'>
        <Col sm={12} md={6}>
          <section className={styles.sec_left}>
            <div className={styles.content_container}>
              <h1>The Three Most Challenging Languages to Learn</h1>
              <p>
                Join me on Friday, September 24, 2021 at 9:00 AM Pacific Standard Time
              </p>
              <button onClick={() => setShowModal(true)} className='btn'>
                Register Now
              </button>
            </div>
          </section>
        </Col>
        <Col sm={12} md={6}>
          <section className={styles.sec_right}>
            <div className={styles.big_ball}></div>
            {/* <div className={styles.top_round_sm}></div> */}
            <div className={styles.img_container}>
              <img src={'https://millieapp.s3.amazonaws.com/content/nolahayes/FullSizeRender.jpg'} />
            </div>
            {/* <div className={styles.bottom_round_sm}></div> */}
          </section>
        </Col>
      </Row>
    </div>
  );
};

export default HeroHeader;
