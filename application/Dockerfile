FROM openjdk:8-alpine

ENV version 0.0.1-SNAPSHOT
ENV dbtype orientdb
ENV logging.file logs/nrstudio.log
ENV logging.level.root info
ENV server.port 8090
ENV orientdb.home /opt/nrstudio/orient
ENV gitdb.base /opt/nrstudio/git
ENV extLib.dir /opt/nrstudio/extLib
ENV deploy.dir /opt/nrstudio/deploy
ENV logging.file /opt/nrstudio/logs/nrstudio.log
ENV server.ssl.enabled false
ENV logging.level.root info

RUN mkdir /opt/nrstudio
COPY extLib/* /opt/nrstudio/extLib/
COPY deploy/* /opt/nrstudio/deploy/
COPY target/application-${version}.jar /opt/nrstudio/application.jar
WORKDIR /opt/nrstudio
EXPOSE 8090
EXPOSE 2480
ENTRYPOINT ["java", "-jar", "application.jar"]