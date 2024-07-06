import React, { useEffect } from 'react';
import styles from './SidebarComponent.module.css';

const SidebarComponent = ({
  isOpen,
  toggleSidebar,
  seance,
  seances,
  fetchSeance,
  fetchLatestPositions,
  loadingSeance,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  handleApply,
  handleSeanceChange,
  isAdmin
}) => {

  useEffect(() => {
    // Дополнительная логика может быть добавлена здесь при необходимости
  }, [isAdmin, seances]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarContent}>
          {loadingSeance ? (
            <p>Загрузка сеанса...</p>
          ) : seance ? (
            <div>
              {isAdmin && (
                <div className={styles.section}>
                  <h2>Выбрать сеанс</h2>
                  <select onChange={handleSeanceChange} value={seance.id}>
                    {seances.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.description} (ID: {s.id})
                      </option>
                    ))}
                  </select>
                    <button className={styles.fetchBeaconsButton} onClick={fetchLatestPositions}>
                    Выбрать все маяки
                  </button>
                </div>
              )}
              <div className={styles.section}>
                <h2>Текущий сеанс {isAdmin}</h2>
                <p>ID: {seance.id}</p>
                <p>ID Маяка: {seance.id_beacon}</p>
                <p>Начало сеанса: {formatDate(seance.data_start)}</p>
                <p>Конец сеанса: {formatDate(seance.data_end)}</p>
              </div>
              <div className={styles.lineSeparator}></div>
              <div className={styles.section}>
                <h2>Описание</h2>
                <p>{seance.description}</p>
                <div className={styles.controls}>
                  <label>
                    Начальная дата:
                    <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </label>
                  <label>
                    Конечная дата:
                    <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </label>
                  <button onClick={handleApply}>Применить</button>
                </div>
              </div>
            </div>
          ) : (
            <p>Нет активного сеанса</p>
          )}
        </div>
      </div>
      <button className={styles.sidebarToggle} onClick={toggleSidebar}>
        {isOpen ? '>' : '<'}
      </button>
    </>
  );
};

export default SidebarComponent;
