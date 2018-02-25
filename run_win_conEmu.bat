
:: This file has to be located at GraphSearch/ on Windows
REM cmd -new_console:s66H
REM cmd -new_console:s50H
REM cmd -new_console:s2T50V
REM cmd -new_console:s3T50V


REM redis-server -new_console:s66V
REM python backend/restapi.py -new_console:s50V
REM celery -A worker worker --loglevel=debug -P solo -new_console:s1T50H
REM python frontend/web/httpserver.py -new_console:s2T50H
REM webpack --watch -new_console:s3T50H


cmd -new_console:s66V

cmd -new_console:s50V
cd backend

cmd -new_console:s1T50H
cd ..
cd frontend
cmd -new_console:s2T50H
cmd -new_console:s3T50H

REM cmd -new_console:s2T50V
REM cmd -new_console:s3T50V

:: Backend