import threading
import signal
import sys
from init import create_app
from mqtt_client import start_mqtt_client
import os

app = create_app()

def run_flask():
    app.run(debug=True)

# Флаг для завершения работы
stop_event = threading.Event()

def signal_handler(signal, frame):
    print("Завершение работы...")
    stop_event.set()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

if __name__ == '__main__':
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        with app.app_context():
            # Запуск MQTT клиента в отдельном потоке
            mqtt_thread = threading.Thread(target=start_mqtt_client, args=(stop_event,))
            mqtt_thread.start()
    
    # Запуск Flask сервера в основном потоке
    run_flask()
