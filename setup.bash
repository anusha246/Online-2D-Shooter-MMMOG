#!/bin/bash
# -------------------------------------------------------------------------
# Here is what we did to set this all up...
sudo chmod -R 711 ../2D-Shooter-MMMOG/

rm package*
npm init
# npm init creates a package.json
# http://browsenpm.org/package.json
# https://docs.npmjs.com/files/package.json
# Take the defaults here

# We are adding libraries, they will be in our local node_modules

npm install express
npm install pg

# check out the package.json now
# check out node_modules

psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f db/schema.sql
nodejs ftd.js

#NEW SETUP:
#rm package*
#npm init
#npm install express
#npm install pg
#npm install ws
#npm install axios
#npm install react-bootstrap bootstrap
#npm install @material-ui/core
#psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f db/schema.sql
#nodejs ftd.js #?? <-- required?
#npm cache clean --force
#npm install
#require('ws'); need to update setup.bash
#npm start #<-- start react
