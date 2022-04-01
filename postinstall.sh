#!/bin/sh

# Bashscript which is executed by bash *AFTER* complete installation is done
# (but *BEFORE* postupdate). Use with caution and remember, that all systems
# may be different! Better to do this in your own Pluginscript if possible.
#
# Exit code must be 0 if executed successfull.
#
# Will be executed as user "loxberry".
#
# We add 5 arguments when executing the script:
# command <TEMPFOLDER> <NAME> <FOLDER> <VERSION> <BASEFOLDER>
#
# For logging, print to STDOUT. You can use the following tags for showing
# different colorized information during plugin installation:
#
# <OK> This was ok!"
# <INFO> This is just for your information."
# <WARNING> This is a warning!"
# <ERROR> This is an error!"
# <FAIL> This is a fail!"

# To use important variables from command line use the following code:
ARGV0=$0 # Zero argument is shell command
ARGV1=$1 # First argument is temp folder during install
ARGV2=$2 # Second argument is Plugin-Name for scipts etc.
ARGV3=$3 # Third argument is Plugin installation folder
ARGV4=$4 # Forth argument is Plugin version
ARGV5=$5 # Fifth argument is Base folder of LoxBerry

echo "<INFO> installing dependencies"
npm --prefix $ARGV5/bin/plugins/$ARGV3 ci --only=production

# Enable proxy mode for apache2
echo "<INFO> enabling proxy for apache"
ln -s ../mods-available/proxy.load $ARGV5/system/apache2/mods-enabled/proxy.load
ln -s ../mods-available/proxy_http.load $ARGV5/system/apache2/mods-enabled/proxy_http.load

echo "<INFO> reloading apache"
sudo systemctl reload apache2

echo "<INFO> starting services"
npm --prefix $ARGV5/bin/plugins/$ARGV3 run start
npm --prefix $ARGV5/bin/plugins/$ARGV3 run manager:start

exit 0;