import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../protect_service/authContext';
import BeaconList from './interface/gui_beacon_list';
import SeanceList from './interface/gui_seance_list';
import styles from './AdminPage.module.css';

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const [, setMessage] = useState('');
  const [activeComponent, setActiveComponent] = useState('BeaconList');

  useEffect(() => {
    const fetchAdminData = async () => {
      const response = await fetch('http://127.0.0.1:5000/admin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error);
      }
    };

    fetchAdminData();
  }, [user.token]);

  return (
    <div className={styles['admin-page-background']}>
      <div className={styles['admin-container']}>
        <h2>Панель Администратора</h2>
        <div className={styles['button-container']}>
          <button 
            className={styles['switch-button']} 
            onClick={() => setActiveComponent('BeaconList')}
          >
            Маяки
          </button>
          <button 
            className={styles['switch-button']} 
            onClick={() => setActiveComponent('SeanceList')}
          >
            Сеансы
          </button>
        </div>
        <div className={styles['component-wrapper']}>
          {activeComponent === 'BeaconList' && <BeaconList />}
          {activeComponent === 'SeanceList' && <SeanceList />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
