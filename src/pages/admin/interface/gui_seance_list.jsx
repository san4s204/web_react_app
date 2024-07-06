import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../protect_service/authContext';
import styles from './SeanceList.module.css'; // Импорт CSS модуля

const SeanceList = () => {
  const { user } = useContext(AuthContext);
  const [seances, setSeances] = useState([]);
  const [beacons, setBeacons] = useState([]);
  const [users, setUsers] = useState([]);
  const [newSeance, setNewSeance] = useState({
    id_beacon: '',
    id_user: '',
    data_start: '',
    data_end: '',
    description: ''
  });
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSeances = async () => {
      const response = await fetch('http://127.0.0.1:5000/api/seances', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setSeances(data);
      } else {
        setMessage(data.error);
      }
    };

    const fetchBeacons = async () => {
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
    };

    const fetchUsers = async () => {
      const response = await fetch('http://127.0.0.1:5000/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        setMessage(data.error);
      }
    };

    fetchBeacons();
    fetchUsers();
    fetchSeances();
  }, [user.token]);

  const handleAddSeance = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/seances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newSeance)
      });

      const data = await response.json();
      if (response.ok) {
        setSeances([...seances, data]);
        setNewSeance({
          id_beacon: '',
          id_user: '',
          data_start: '',
          data_end: '',
          description: ''
        });
        setMessage('Сеанс успешно добавлен');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('При добавлении сеанса произошла ошибка.');
    }
  };

  const handleSelectSeance = (seance) => {
    setSelectedSeance(seance);
  };

  const handleUpdateSeance = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/seances/${selectedSeance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(selectedSeance)
      });

      const data = await response.json();
      if (response.ok) {
        setSeances(seances.map(s => (s.id === selectedSeance.id ? data : s)));
        setMessage('Сеанс успешно обновлён');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('При обновлении сеанса произошла ошибка.');
    }
  };

  const handleDeactivateSeance = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/seances/${selectedSeance.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        setSeances(seances.filter(s => s.id !== selectedSeance.id));
        setSelectedSeance(null);
        setMessage('Сеанс успешно удалён');
      } else {
        const data = await response.json();
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('При отключении сеанса произошла ошибка.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSeance(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSelectedSeanceChange = (e) => {
    const { name, value } = e.target;
    setSelectedSeance(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    handleInputChange(e);
    e.target.blur();
  };

  const handleSelectedSeanceDateChange = (e) => {
    handleSelectedSeanceChange(e);
    e.target.blur();
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableContainer}>
        <h3 className={styles.header}>Сеансы</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Описание</th>
              <th>Маяк</th>
              <th>Пользователь</th>
              <th>Начало</th>
              <th>Конец</th>
            </tr>
          </thead>
          <tbody>
            {seances.map(seance => (
              <tr key={seance.id} onClick={() => handleSelectSeance(seance)}>
                <td>{seance.description}</td>
                <td>{seance.id_beacon}</td>
                <td>{seance.id_user}</td>
                <td>{new Date(seance.data_start).toLocaleString('ru-RU')}</td>
                <td>{new Date(seance.data_end).toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.panel}>
        <h3 className={styles.header}>Добавить сеанс</h3>
        <form className={styles.form} onSubmit={handleAddSeance}>
          <select
            value={newSeance.id_beacon}
            onChange={(e) => setNewSeance({ ...newSeance, id_beacon: e.target.value })}
          >
            <option value="">Выберите маяк</option>
            {beacons.map(beacon => (
              <option key={beacon.id} value={beacon.id}>{beacon.id_device}</option>
            ))}
          </select>
          <select
            value={newSeance.id_user}
            onChange={(e) => setNewSeance({ ...newSeance, id_user: e.target.value })}
          >
            <option value="">Выберите пользователя</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
          <input
          type="datetime-local"
          name="data_start"
          value={newSeance.data_start}
          onChange={handleDateChange}
          className={styles.datePicker}
        />
        <input
          type="datetime-local"
          name="data_end"
          value={newSeance.data_end}
          onChange={handleDateChange}
          className={styles.datePicker}
        />
        <input
          type="text"
          name="description"
          placeholder="Описание"
          value={newSeance.description}
          onChange={handleInputChange}
        />
          <button type="submit" className={styles.button}>Добавить сеанс</button>
        </form>
      </div>
      {selectedSeance && (
        <div className={styles.details}>
          <h3 className={styles.header}>Детали сеанса</h3>
          <form className={styles.form} onSubmit={handleUpdateSeance}>
            <select
              name="id_beacon"
              value={selectedSeance.id_beacon}
              onChange={handleSelectedSeanceChange}
            >
              <option value="">Выберите маяк</option>
              {beacons.map(beacon => (
                <option key={beacon.id} value={beacon.id}>{beacon.id_device}</option>
              ))}
            </select>
            <select
              name="id_user"
              value={selectedSeance.id_user}
              onChange={handleSelectedSeanceChange}
            >
              <option value="">Выберите пользователя</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
            <input
              type="datetime-local"
              name="data_start"
              value={selectedSeance.data_start}
              onChange={handleSelectedSeanceDateChange}
              className={styles.datePicker}
            />
            <input
              type="datetime-local"
              name="data_end"
              value={selectedSeance.data_end}
              onChange={handleSelectedSeanceDateChange}
              className={styles.datePicker}
            />
            <input
              type="text"
              name="description"
              placeholder="Описание"
              value={selectedSeance.description}
              onChange={handleSelectedSeanceChange}
            />
            <button type="submit" className={styles.button}>Обновить сеанс</button>
            <button type="button" className={styles.button} onClick={handleDeactivateSeance}>Удалить сеанс</button>
          </form>
        </div>
      )}
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default SeanceList;
