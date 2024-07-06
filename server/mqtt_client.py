import json
import paho.mqtt.client as mqtt
from datetime import datetime, timezone
from init import db, create_app
from models import Position, Beacon

# Настройки подключения
broker_address = "m9.wqtt.ru"
port = 16454
all_topics = "#"
username = "Admin"
password = "gexsocopter12"

# Черный список топиков
blacklisted_topics = [
    "msh/RU/2/e/LongFast/!55c81380",
    "msh/RU/2/map/"
]

app = create_app()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Подключение успешно")
        client.subscribe(all_topics)
    else:
        print(f"Ошибка подключения. Код ошибки: {rc}")

def convert_timestamp(timestamp):
    return datetime.fromtimestamp(timestamp, timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

def on_message(client, userdata, msg):
    if any(blacklisted_topic in msg.topic for blacklisted_topic in blacklisted_topics):
        print(f"Сообщение из черного списка топиков: {msg.topic}")
        return

    with app.app_context():
        try:
            message = msg.payload.decode('utf-8')
            try:
                data = json.loads(message)
                if 'type' in data:
                    if data['type'] == 'position':
                        latitude = data['payload']['latitude_i'] / 1e7
                        longitude = data['payload']['longitude_i'] / 1e7
                        timestamp = convert_timestamp(data['timestamp'])
                        sender = data['sender']

                        # Найти или создать маяк
                        beacon = Beacon.query.filter_by(id_device=sender).first()
                        if not beacon:
                            beacon = Beacon(id_device=sender, id_mqtt=msg.topic)
                            db.session.add(beacon)
                            db.session.commit()

                        # Создание записи о позиции
                        position = Position(
                            beacon_id=beacon.id,
                            lat=latitude,
                            lng=longitude,
                            data_recived=timestamp
                        )
                        db.session.add(position)
                        db.session.commit()

                        print(f"Позиционные данные сохранены: Широта: {latitude}, Долгота: {longitude}, Время: {timestamp}, Отправитель: {sender}")
                    elif data['type'] == 'telemetry':
                        timestamp = convert_timestamp(data['timestamp'])
                        print(f"Телееметрические данные: {json.dumps(data['payload'], indent=4)}, Время: {timestamp}")
                    else:
                        print(f"Неизвестный тип данных: {data['type']}, Данные: {json.dumps(data, indent=4)}")
                else:
                    print(f"Данные: {json.dumps(data, indent=4)}")
            except json.JSONDecodeError:
                print(f"Сообщение (не JSON) в топике {msg.topic}: {message}")

                # Записать сообщение в базу данных с маяками
                # Извлечь id_device из топика
                id_device = msg.topic.split('/')[-1]
                # Создать запись с сообщением и id_device
                beacon = Beacon.query.filter_by(id_device=id_device).first()
                if beacon:
                    beacon.message = message
                    db.session.commit()
                    print(f"Сообщение записано для маяка: {id_device}")

        except Exception as e:
            print(f"Произошла ошибка в топике {msg.topic}: {e}")

def start_mqtt_client(stop_event):
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.username_pw_set(username, password)
    client.connect(broker_address, port)

    while not stop_event.is_set():
        client.loop()

    client.disconnect()
