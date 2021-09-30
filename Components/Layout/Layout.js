import React from 'react';
import { Row, Col } from 'reactstrap';
import TopNav from '../TopNav/TopNav';
import SideNav from '../SideNav/SideNav';
import styles from './layout.module.scss';
import QuizNav from '../QuizNav/QuizNav';

const Layout = (props) => (
  <div className={styles.layout_container}>
    <TopNav />
    {props.isHide ? (
      <Row>
        <Col sm={12}>
          <div className={styles.child_container}>{props.children}</div>
        </Col>
      </Row>
    ) : props.quizNav ? (
      <Row>
        <Col sm={2} md={2}>
          <QuizNav flag={props.flag} />
        </Col>
        <Col sm={10}>
          <div className={styles.child_container}>{props.children}</div>
        </Col>
      </Row>
    ) : (
      <Row>
        <Col sm={2} md={2}>
          <SideNav />
        </Col>
        <Col sm={10}>
          <div className={styles.child_container}>{props.children}</div>
        </Col>
      </Row>
    )}
  </div>
);

export default Layout;
