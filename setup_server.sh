# Welcome to Ubuntu 16.04.3 LTS (GNU/Linux 4.4.0-1038-aws x86_64)


# APACHE
sudo apt-get update
sudo apt-get install apache2
sudo apt-get install libapache2-mod-wsgi

# ANACONDA (flask, networkx, pymongo, redis) to /home/ubuntu/bin/anaconda2
mkdir tmp
cd tmp
curl -O https://repo.continuum.io/archive/Anaconda2-5.0.1-Linux-x86_64.sh
bash Anaconda2-5.0.1-Linux-x86_64.sh
cd ..
conda update conda
conda update anaconda

# REDIS, NODEJS 
conda install -c anaconda redis=3.2.0
conda install -c conda-forge nodejs
pip install 'celery[redis]'
pip install httpie

# GET REPO
mkdir git
cd git
git clone https://github.com/sfbrunner/GraphSearch.git

# RUN SERVICES: run.sh

