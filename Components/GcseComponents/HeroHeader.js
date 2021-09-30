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
              <h1>GCSE Spanish - Parents Q&A</h1>
              <p>
                Hello everyone! As a tutor, I always like to have a short
                meeting with my private students and their parents before
                starting tuition sessions, so we can discuss what areas they
                need to work on, what their goals are, and of course how the
                lessons work. So, as I launch my new workshops, I thought why
                not share this information with you all, so you can see exactly
                how they are structured, what topics we will cover, and how they
                will help you to achieve those top grades!
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
              <img src={'/Assets/gcsc.png'} />
            </div>
            {/* <div className={styles.bottom_round_sm}></div> */}
          </section>
        </Col>
      </Row>
    </div>
  );
};

export default HeroHeader;
