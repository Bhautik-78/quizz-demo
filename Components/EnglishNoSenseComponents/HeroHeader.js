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
              <h1>Get A Handle on Phrasal Verbs</h1>
              <p>
                Join my free LIVE session where I will cover 10 of the most widely used Phrasal Verbs with the word "GET" in them.  Learn how to use them and what they mean!
                <br />
                <br />
                Join me on Saturday, September 25, 2021 at 11:00 AM Central Standard Time
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
              <img src={'https://millieapp.s3.amazonaws.com/content/englishnosense.png'} />
            </div>
            {/* <div className={styles.bottom_round_sm}></div> */}
          </section>
        </Col>
      </Row>
    </div>
  );
};

export default HeroHeader;
