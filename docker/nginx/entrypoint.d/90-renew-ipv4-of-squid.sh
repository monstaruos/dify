sed -E -i -e "s/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+;(#=squid)/$(/root/bin/mydig squid | sed -E -e 's/\.[0-9]+$/\.1/');\1/g" /etc/nginx/conf.d/default.conf
