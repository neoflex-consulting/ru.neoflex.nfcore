#!/bin/sh 
SERVICE_NAME=nrstudio 
PATH_TO_JAR=/opt/nrstudio/application-0.0.1-SNAPSHOT.jar 
PID_PATH_NAME=/opt/nrstudio/nrstudio-pid 
SYS_PARAMS="-Xmx8g -Ddbtype=orientdb -Dorientdb.home=/opt/nrstudio/orientdb -DORIENTDB_ROOT_PASSWORD=ne0f1ex -Dgitdb.base=/opt/nrstudio/git -DextLib.dir=/opt/nrstudio/extLib -Ddeploy.dir=/opt/nrstudio/deploy -Dlogging.file=/opt/nrstudio/logs/nrstudio.log -Dlogging.level.root=info -Dserver.port=8090 -Dserver.ssl.key-store-type=PKCS12 -Dserver.ssl.key-store=file:/opt/nrstudio/keystore.p12 -Dserver.ssl.key-store-password=Ne0f1ex -Dserver.ssl.key-alias=tomcat"
case $1 in 
start)
       echo "Starting $SERVICE_NAME ..."
  if [ ! -f $PID_PATH_NAME ]; then 
       nohup java $SYS_PARAMS -jar $PATH_TO_JAR 2>> /dev/null >>/dev/null & echo $! > $PID_PATH_NAME  
       echo "$SERVICE_NAME started ..."         
  else 
       echo "$SERVICE_NAME is already running ..."
  fi
;;
stop)
  if [ -f $PID_PATH_NAME ]; then
         PID=$(cat $PID_PATH_NAME);
         echo "$SERVICE_NAME stoping ..." 
         kill $PID;         
         echo "$SERVICE_NAME stopped ..." 
         rm $PID_PATH_NAME       
  else          
         echo "$SERVICE_NAME is not running ..."   
  fi    
;;    
restart)  
  if [ -f $PID_PATH_NAME ]; then 
      PID=$(cat $PID_PATH_NAME);    
      echo "$SERVICE_NAME stopping ..."; 
      kill $PID;           
      echo "$SERVICE_NAME stopped ...";  
      rm $PID_PATH_NAME     
      echo "$SERVICE_NAME starting ..."  
       nohup java $SYS_PARAMS -jar $PATH_TO_JAR 2>> /dev/null >>/dev/null & echo $! > $PID_PATH_NAME  
      echo "$SERVICE_NAME started ..."    
  else           
      echo "$SERVICE_NAME is not running ..."    
     fi     ;;
 esac