FROM openjdk:8-alpine

ENV dbtype orientdb
ENV logging.file logs/nrstudio.log
ENV logging.level.root info
ENV server.port 8090
ENV version 0.0.1-SNAPSHOT
ENV orientdb.home /opt/nrstudio/orientdb

COPY extLib/* /opt/nrstudio/extLib/
COPY deploy/* /opt/nrstudio/deploy/
COPY target/application-${version}.jar /opt/nrstudio/application.jar
WORKDIR /opt/nrstudio
EXPOSE 8090
EXPOSE 2480
ENTRYPOINT ["java", "-jar", "application.jar"]