## Quick screen guide:
## Check running processes: screen -ls
## Reattach existing screen: screen -R [screen]
## Detach from screen: screen -D [screen]
## Start new screen and enter: screen -S [screen]
## Start new screen from command detach: screen -S [screen] -d -m [command]

# we need an instance of redis server
#redis-server &
screen -S redis -d -m redis-server

# we need the backend to run
# python backend/restapi.py &
screen -S restapi -d -m python backend/restapi.py

# we need celery to run -> change arguments when multi threading possible
cd backend
screen -S celery -d -m celery -A worker worker --loglevel=debug -P solo
cd ..

# we need an instance of mongo db running
screen -S mongod -d -m "sudo mongod --dbpath /data1/mongodb"

# we need our frontend to run
screen -S httpserver -d -m python frontend/web/httpserver.py

# for editing jsx files we need gulp
# web/gulp
cd frontend/web
screen -S gulp -d -m webpack --watch
cd ../..

# for prod build go to web folder
# webpack --config webpack.prod.js

# for dev build go to web folder
# webpack --config webpack.dev.js

# test the backend:
# http PUT http://localhost:8080 search_string="Stratton Cancer Breast Women"
