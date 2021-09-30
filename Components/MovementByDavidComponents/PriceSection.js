/* eslint-disable */
import React from 'react';
import { Row, Col } from 'reactstrap';
import styles from './landing.module.scss';

const PriceSection = ({ setShowModal }) => {
  return (
    <div className={styles.price_sec_container}>
      <div className={styles.price_sec_content}>
        <Row>
          <Col sm={12} md={4}>
            <section className={styles.price_card_container}>
              <div
                onClick={() => setShowModal(true)}
                className={styles.price_card}
              >
                {/* <div className={styles.price_card_content} >

                <div className={styles.top_tag_container}>
                  <p>Less than 8 cups of coffee per month</p>
                </div>
                <div className={styles.price_container}>
                  <h2>$22.99 </h2>
                  <span>/month</span>
                </div>
                <div className={styles.title_container}>
                  <h2>Movement By David</h2>
                  <p>
                    Join a community dedicated to achieving their flexibility
                    goals by following my step-by-step stretching routines and
                    movement methods.
                  </p>
                </div>
                <ul className={styles.list_features}>
                  {[
                    'Improve your flexibility and reach your movement goals',
                    'Gain new streatching skills such as the splits',
                    'Direct access to an experienced movement expert  and pilates professional',
                    'Dedicated community on the same journey',
                    'Monthly live events learning new movement methods',
                    'On-going support, accountibility,  and bonus resources',
                  ].map(item => {
                    return (
                      <li>
                        <img src='/Assets/movementbydavid/check-circle-1.png' />
                        <p>{item}</p>
                      </li>
                    );
                  })}
                </ul>
                <div className={styles.btn_container}>
                  <button className='btn'>Join the Community Now</button>
                </div>
                </div> */}
              </div>
            </section>
          </Col>
          <Col sm={12} md={4}>
            <section className={styles.price_img_container}>
              <img src='/Assets/movementbydavid/price.png' />
            </section>
          </Col>
          <Col sm={12} md={4}>
            <section className={styles.topics_container}>
              <div className={styles.content_container}>
                <img src='/Assets/movementbydavid/price_right.png' />
              </div>
            </section>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PriceSection;
