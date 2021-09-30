import React from 'react';
import { Col, Row } from 'reactstrap';
import styles from './footer.module.scss';

const Footer = () => (
  <div className={styles.footer_container}>
    <Row>
      <Col sm={12} md={6}>
        <div className={styles.img_container}>
          <img src="https://millieapp.s3.amazonaws.com/assets/sundae.png" alt="logo" />
        </div>
      </Col>
      <Col sm={12} md={6}>
        <Row noGutters>
          <Col xs={4} sm={6} md={4}>
            <div className={styles.link_container}>
              <ul>
                <a href="https://www.getsundae.com/home"><li>home</li></a>
                <a href="https://www.getsundae.com/learn-more"><li>learn more</li></a>
                <a href="https://www.getsundae.com/contact"><li>contact</li></a>
              </ul>
            </div>
          </Col>
          <Col xs={4} sm={6} md={4}>
            <div className={styles.link_container}>
              <ul>
                <a href="https://www.getsundae.com/faqs"><li>faq's</li></a>
                <a href="https://www.getsundae.com/privacy"><li>privacy</li></a>
                <a href="https://www.getsundae.com/tos"><li>terms & condition</li></a>
              </ul>
            </div>
          </Col>
          <Col xs={4} sm={6} md={4}>
            <div className={styles.link_container}>
              <ul>
                <a href="http://squarespace.com/"><li>facebook</li></a>
                <a href="http://squarespace.com/"><li>instagram</li></a>
              </ul>
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  </div>
);

export default Footer;
