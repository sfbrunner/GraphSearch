# GraphSearch

## Setup in a new AWS instance

* Link Git web folder to html folder of instance
sudo ln -sT ~/path/to/web/folder/ /var/www/html/git_dev

* Update WSGI Daemon settings.
Add the following to the WSGI configs:

WSGIDaemonProcess git_dev threads=5
        WSGIScriptAlias /git_dev /var/www/html/git_dev/force.wsgi

        <Directory git_dev>
                WSGIProcessGroup git_dev
                WSGIApplicationGroup %{GLOBAL}
                Order deny,allow
                Allow from all
        </Directory>

* Update .wsgi file in /web folder
sys.path.insert(0, '/var/www/html/git_dev') 
