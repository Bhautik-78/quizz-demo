import React from 'react';
import styles from './topnav.module.scss';

const TopNav = () => (
  <nav className={`${styles.nav_container}`}>
    <div className={styles.logo_container}>
      <img src="https://millieapp.s3.amazonaws.com/assets/sundae.png" alt="logo" />
    </div>
  </nav>
);

export default TopNav;
