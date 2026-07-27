import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, title, onClick, hoverable = false }) => {
  return (
    <div 
      className={`${styles.card} ${hoverable ? styles.hoverable : ''}`}
      onClick={onClick}
    >
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Card;