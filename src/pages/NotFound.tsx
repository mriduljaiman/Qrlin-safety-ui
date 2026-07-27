import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound: React.FC = () => {
  return (
    <div className={styles.container}>
    <h1 className={styles.code}>404</h1>
    <p className={styles.message}>Page not found</p>
    <Link to="/" className={styles.homeLink}>
    Go back home
    </Link>
    </div>
    );
    };
    export default NotFound;