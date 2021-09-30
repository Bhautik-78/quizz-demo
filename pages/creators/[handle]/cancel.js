/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Link from 'next/link';
import Layout from '../../../Components/Layout/Layout';
import styles from '../../../styles/success.module.scss';

const Success = () => (
  <Layout isHide>
    <div className={styles.success_container}>
        <img src="/Assets/error.png" />
      <h1>Sorry Payment Failed</h1>
      {/* <div className={styles.logos_container}>
        <a href="https://play.google.com/store/apps/details?id=com.ubiq.urban"><img src="/Assets/play.png" alt="Playstore" /></a>
        <a href="https://apps.apple.com/us/app/sundae/id1538225759"><img src="/Assets/app.png" alt="iOS" /></a>
      </div> */}
    </div>
  </Layout>
);

export default Success;
