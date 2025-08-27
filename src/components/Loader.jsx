// components/Loader.js
import React from 'react';
import styles from '../components/Loader.module.css';

const Loader = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.boxes}>
        <div className={styles.box}>
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className={styles.box}>
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className={styles.box}>
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className={styles.box}>
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    </div>
  );
};

export default Loader;