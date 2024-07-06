import React, { useEffect, useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import styles from './MapComponent.module.css';
import SidebarComponent from './SidebarComponent';
import { AuthContext } from '../../protect_service/authContext';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RedIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: styles['leaflet-div-icon-red']
});

const GreenIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: styles['leaflet-div-icon-green']
});

const MapComponent = () => {
  const { user } = useContext(AuthContext);
  const [markers, setMarkers] = useState([]);
  const [seance, setSeance] = useState(null);
  const [seances, setSeances] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [isLatestPositions, setIsLatestPositions] = useState(false);

  const isAdmin = user?.roles?.includes('admin');

  const fetchMarkers = async (seanceId) => {
    try {
      const url = new URL('http://127.0.0.1:5000/positions');
      if (appliedStartDate) url.searchParams.append('start', appliedStartDate);
      if (appliedEndDate) url.searchParams.append('end', appliedEndDate);
      if (seanceId) url.searchParams.append('seanceId', seanceId);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setMarkers(data);
      setIsLatestPositions(false);  // Сбрасываем состояние
    } catch (error) {
      console.error("Ошибка при загрузке маркеров:", error);
    }
  };

  const fetchLatestPositions = async () => {
    try {
      const url = new URL('http://127.0.0.1:5000/latest_positions');
  
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setMarkers(data);
      setIsLatestPositions(true);  // Устанавливаем состояние
    } catch (error) {
      console.error("Ошибка при загрузке последних позиций маяков:", error);
    }
  };

  const fetchSeances = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/seances', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSeances(data);
        if (data.length > 0) {
          setSeance(data[0]);
        }
      } else {
        throw new Error('Response not OK');
      }
    } catch (error) {
      console.error("Ошибка при загрузке сеансов:", error);
      setSeances([]);
    }
  };

  const handleSeanceChange = (e) => {
    const selectedSeance = seances.find(seance => seance.id === parseInt(e.target.value));
    setSeance(selectedSeance);
    setIsLatestPositions(false);  // Сбрасываем состояние
  };

  const formatDateToRussian = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  useEffect(() => {
    fetchSeances();
  }, []);

  useEffect(() => {
    if (seance?.id && !isLatestPositions) {
      fetchMarkers(seance.id);
      const intervalId = setInterval(() => fetchMarkers(seance.id), 10000);
      return () => clearInterval(intervalId);
    }
  }, [appliedStartDate, appliedEndDate, seance?.id, isLatestPositions]);

  const handleApply = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setIsLatestPositions(false);  // Сбрасываем состояние
  };

  return (
    <div className={styles.mapContainer}>
      <SidebarComponent
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        seance={seance}
        seances={seances}
        fetchSeance={fetchSeances}
        fetchLatestPositions={fetchLatestPositions}
        loadingSeance={!seance && seance !== null}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        handleApply={handleApply}
        handleSeanceChange={handleSeanceChange}
        isAdmin={isAdmin}
      />
      <MapContainer center={[53.024265, 158.643503]} zoom={13} className={styles.map} attributionControl={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.length > 0 && !isLatestPositions && (
          <Polyline positions={markers.map(marker => [marker.lat, marker.lng])} className={styles.animatedPolyline} />
        )}
        <MarkerClusterGroup chunkedLoading>
        {markers.map((marker, index) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={index === 0 ? RedIcon : (index === markers.length - 1 ? GreenIcon : DefaultIcon)}
          >
            <Tooltip permanent direction="left" offset={[0, -20]}>
              <span>{marker.beacon_id}</span>
            </Tooltip>
            <Popup>
              <div>
                <div>{formatDateToRussian(marker.data_recived)}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
