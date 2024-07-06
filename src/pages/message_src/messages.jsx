import React, { useState, useEffect } from 'react';
import styles from './messages.module.css'; // Импорт стилей

const Messages = () => {
  const [beacons, setBeacons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  useEffect(() => {

    const fetchBeacons = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/beacons', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        const data = await response.json();
        console.log(data);
        setBeacons(data); // Предполагается, что setBeacons - это ваша функция установки состояния для маяков
      } catch (error) {
        console.error("Ошибка при загрузке маяков:", error);
      }
    };

    fetchBeacons();

  }, [])
  
  

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = beacons.slice(indexOfFirstMessage, indexOfLastMessage);

  const totalPages = Math.ceil(beacons.length / messagesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={styles['messages-container']}>
      <ul className={styles['message-list']}>
        {currentMessages.map((beacon) => (
          <li key={beacon.id} className={styles['message-item']}>
            <div className={styles['message-beaconId']}>Beacon ID: {beacon.id_device}</div>
            <div className={styles['message-text']}>{(beacon.message)}</div>
          </li>
        ))}
      </ul>
      <div className={styles['pagination']}>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Назад
        </button>
        {[...Array(totalPages).keys()].map((number) => (
          <button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            className={currentPage === number + 1 ? styles['active'] : ''}
          >
            {number + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={indexOfLastMessage >= beacons.length}
        >
          Дальше
        </button>
      </div>
    </div>
  );
};

export default Messages;