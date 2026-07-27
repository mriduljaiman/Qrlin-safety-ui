import React from 'react';
import styles from './Loading.module.css';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className={styles.fullScreenContainer}>
        <div className={`${styles.spinner} ${styles[size]}`}></div>
      </div>
    );
  }

  return <div className={`${styles.spinner} ${styles[size]}`}></div>;
};

export default Loading;