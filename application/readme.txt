Сборка образа docker:
mvn package
docker build --no-cache -t nrstudio .
Запуск контейнера:
docker run -d -p 8090:8090 -p 2480:2480 nrstudio

Запуск из исходного кода:
mvn package
docker-compose -f runtime/nrstudio/docker-compose.yml up -d --build
docker-compose -f runtime/nrstudio/docker-compose.yml start
