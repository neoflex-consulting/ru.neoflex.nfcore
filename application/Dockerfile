FROM openjdk:8-alpine
COPY extLib/* /opt/nrstudio/extLib/
COPY deploy/* /opt/nrstudio/deploy/
COPY target/application-0.0.1-SNAPSHOT.jar /opt/nrstudio/
WORKDIR /opt/nrstudio
ENV dbtype orientdb
ENV logging.file logs/nrstudio.log
ENV logging.level.root info
ENV server.port 8090
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "application-0.0.1-SNAPSHOT.jar"]