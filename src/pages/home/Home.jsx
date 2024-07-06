import React from 'react';
import styles from './Home.module.css'; // Используем стили из модуля CSS

const Home = () => {
  return (
    <div className={styles['home-container']}>
      <div className={styles['background-overlay']}>
        <div className={styles['text-container']}>
          <h1>Крылья Камчатки</h1>
          <p>Производство дронов и обучение операторов. Оснащаем будущее, предоставляя передовые технологии и обучение для успешного полета.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
