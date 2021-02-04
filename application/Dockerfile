FROM openjdk:8-alpine

ENV version 0.0.1-SNAPSHOT
ENV dbtype orientdb
ENV logging.file logs/nrstudio.log
ENV logging.level.root info
ENV server.port 8090
ENV orientdb.home /opt/nrstudio/orientdb
ENV gitdb.base /opt/nrstudio/gitdb

COPY extLib/* /opt/nrstudio/extLib/
COPY deploy/* /opt/nrstudio/deploy/
COPY target/application-${version}.jar /opt/nrstudio/application.jar
WORKDIR /opt/nrstudio
EXPOSE 8090
EXPOSE 2480
ENTRYPOINT ["java", "-jar", "application.jar"]