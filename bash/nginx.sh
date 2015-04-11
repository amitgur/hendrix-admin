#!/bin/bash
rm /etc/nginx/sites-enabled/hendrix-bandpad.nginx
rm /etc/nginx/sites-available/hendrix-bandpad.nginx
cp ~/bandpad/hendrix-bandpad/bash/hendrix-bandpad.nginx /etc/nginx/sites-available
cd /etc/nginx/sites-enabled
ln -s ../sites-available/hendrix-bandpad.nginx .
service nginx restart


