Сборка образа docker:
docker build --no-cache -t nrstudio .
Запуск контейнера:
docker run -d -p 8090:8090 -p 2480:2480 nrstudio