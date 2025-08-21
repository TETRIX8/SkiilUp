#!/bin/bash

echo "Останавливаем текущий сервер..."
pkill -f "python.*server.py" || true
pkill -f "python.*main.py" || true

echo "Ждем 3 секунды..."
sleep 3

echo "Запускаем сервер с новыми настройками..."
cd "$(dirname "$0")"
python3 server.py > server.log 2>&1 &

echo "Сервер запущен в фоновом режиме"
echo "Логи можно посмотреть командой: tail -f server.log"
