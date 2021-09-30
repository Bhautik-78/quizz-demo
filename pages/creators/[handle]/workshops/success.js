/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Link from 'next/link';
import Layout from '../../../../Components/Layout/Layout';
import styles from '../../../../styles/success.module.scss';

const Success = () => (
  <Layout isHide>
    <div className={styles.success_container}>
      <h1>You have subscribed for the workshop successfully!</h1>
      <p>
        You will be emailed when the workshop sessions begin
      </p>
    </div>
  </Layout>
);

export default Success;
