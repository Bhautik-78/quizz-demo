/* eslint-disable */
import React from 'react';
import { Row, Col } from 'reactstrap';
import styles from './landing.module.scss';

const HeroHeader = ({setShowModal}) => {
  return (
    <div className={styles.top_header_container}>
      <Row className='flex-column-reverse flex-lg-row'>
        <Col sm={12} md={6}>
          <section className={styles.sec_left}>
            <div className={styles.content_container}>
              {/* <h6 >{data.tagline.content}</h6> */}
              <h1>Movement by David</h1>
              <p>“Stay Flexy”- David Thurin, </p>
              <p>
                An exclusive platform for anyone who is serious about their
                flexibility and the health of their muscles. The content on this
                platform will include full stretching routines and step-by-step
                progressions to skills such as the splits! Ask me questions,
                chat with me directly, engage with a community of learners, join
                zoom sessions, and follow along with stretching routines that I
                ACTUALLY use.
              </p>
              <button onClick={()=>setShowModal(true)} className='btn'>Join the Waitlist</button>
            </div>
          </section>
        </Col>
        <Col sm={12} md={6}>
          <section className={styles.sec_right}>
            <div className={styles.big_ball}></div>
            <div className={styles.top_round_sm}>
              <img src='/Assets/movementbydavid/top_circle.png' />
            </div>
            <div className={styles.img_container}>
              <img src='/Assets/movementbydavid/topheader.png' />
            </div>
            <div className={styles.bottom_round_sm}>
              <img src='/Assets/movementbydavid/bottom_circle.png' />
            </div>
          </section>
        </Col>
      </Row>
    </div>
  );
};

export default HeroHeader;
