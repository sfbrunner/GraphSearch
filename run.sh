
# we need an instance of redis server
redis-server &

# we need the backend to run
python backend/restapi.py &

# we need celery to run -> change arguments when multi threading possible
celery -A worker worker --loglevel=debug -P solo &

# we need an instance of mongo db running
mongod &

# we need our frontend to run
python frontend/web/httpserver.py && fg

# for editing jsx files we need gulp
# web/gulp

# test the backend:
# http PUT http://localhost:8080 search_string="Stratton Cancer Breast Women"
