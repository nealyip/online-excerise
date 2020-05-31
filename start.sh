#!/bin/bash
export MYSQL_PWD=$MYSQL_ROOT_PASSWORD
echo $MYSQL_PWD
until mysql -h $MYSQL_HOST -P 3306 -u root; do
  >&2 echo "Mysql is unavailable - sleeping"
  sleep 1
done

>&2 echo "Mysql is up - executing command"
mysql -h $MYSQL_HOST -P 3306 -u root -f < /app/schema.sql

echo "done"
