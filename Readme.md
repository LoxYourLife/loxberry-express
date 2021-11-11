# Loxberry Express Plugin

This plugin is currently under development. Do not use!

````
RewriteEngine On

# RewriteRule ^index.cgi(.\*) http://10.10.0.143:3000/plugins/express/$1 [P,L]

RewriteRule ^/node/(.\*) http://localhost:3000/plugins/express/$1 [P,L]
