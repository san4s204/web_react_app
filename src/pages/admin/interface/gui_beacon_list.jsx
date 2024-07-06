import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../protect_service/authContext';
import styles from './BeaconList.module.css';

const BeaconList = () => {
  const { user } = useContext(AuthContext);
  const [beacons, setBeacons] = useState([]);
  const [selectedBeacon, setSelectedBeacon] = useState(null);
  const [newBeacon, setNewBeacon] = useState({ id_device: '', id_mqtt: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBeacons = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/beacons', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          setBeacons(data);
        } else {
          setMessage(data.error);
        }
      } catch (error) {
        setMessage('An error occurred while fetching beacons.');
      }
    };

    fetchBeacons();
  }, [user.token]);

  const handleAddBeacon = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/beacons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newBeacon)
      });

      const data = await response.json();
      if (response.ok) {
        const updatedResponse = await fetch('http://127.0.0.1:5000/api/beacons', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });
        const updatedData = await updatedResponse.json();
        if (updatedResponse.ok) {
          setBeacons(updatedData);
          setNewBeacon({ id_device: '', id_mqtt: '' });
          setMessage('Маяк успешно добавлен');
        } else {
          setMessage(updatedData.error);
        }
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('An error occurred while adding the beacon.');
    }
  };

  const handleSelectBeacon = (beacon) => {
    setSelectedBeacon(beacon);
  };

  const handleUpdateBeacon = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://127.0.0.1:5000/api/beacons/${selectedBeacon.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(selectedBeacon)
    });

    const data = await response.json();
    if (response.ok) {
      setBeacons(beacons.map(b => b.id === selectedBeacon.id ? selectedBeacon : b));
      setMessage('Маяк успешно обновлён');
    } else {
      setMessage(data.error);
    }
  };

  const handleDeleteBeacon = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/beacons/${selectedBeacon.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setBeacons(beacons.filter(b => b.id !== selectedBeacon.id));
        setSelectedBeacon(null);
        setMessage('Маяк успешно удалён');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('An error occurred while deleting the beacon.');
    }
  };

  return (
    <div className={styles.beaconContainer}>
      <div className={styles.sidebar}>
        <h3>Маяки</h3>
        <ul>
          {beacons.map(beacon => (
            <li key={beacon.id} onClick={() => handleSelectBeacon(beacon)}>
              {beacon.id} - {beacon.id_device} - {beacon.id_mqtt}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.content}>
        <h3>Добавить новый маяк</h3>
        <form onSubmit={handleAddBeacon}>
          <input
            type="text"
            placeholder="Device ID"
            value={newBeacon.id_device}
            onChange={(e) => setNewBeacon({ ...newBeacon, id_device: e.target.value })}
          />
          <input
            type="text"
            placeholder="MQTT ID"
            value={newBeacon.id_mqtt}
            onChange={(e) => setNewBeacon({ ...newBeacon, id_mqtt: e.target.value })}
          />
          <button type="submit">Добавить</button>
        </form>
        {selectedBeacon && (
          <div className={styles.selectedBeaconDetails}>
            <h3>Свойства маяка</h3>
            <form onSubmit={handleUpdateBeacon}>
              <input
                type="text"
                placeholder="Device ID"
                value={selectedBeacon.id_device}
                onChange={(e) => setSelectedBeacon({ ...selectedBeacon, id_device: e.target.value })}
              />
              <input
                type="text"
                placeholder="MQTT ID"
                value={selectedBeacon.id_mqtt}
                onChange={(e) => setSelectedBeacon({ ...selectedBeacon, id_mqtt: e.target.value })}
              />
              <button type="submit">Обновить</button>
              <button type="button" onClick={handleDeleteBeacon}>Удалить</button>
            </form>
          </div>
        )}
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default BeaconList;