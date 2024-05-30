sed -E -i -e "s/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(\/24; *# *= *localnet)/$(hostname -I | sed -E -e 's/^ *([^ ]+) *$/\1/g')\1/g" /etc/nginx/conf.d/default.conf
