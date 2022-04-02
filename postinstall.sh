#!/bin/sh

# To use important variables from command line use the following code:
COMMAND=$0    # Zero argument is shell command
PTEMPDIR=$1   # First argument is temp folder during install
PSHNAME=$2    # Second argument is Plugin-Name for scipts etc.
PDIR=$3       # Third argument is Plugin installation folder
PVERSION=$4   # Forth argument is Plugin version
#LBHOMEDIR=$5 # Comes from /etc/environment now. Fifth argument is
              # Base folder of LoxBerry
PTEMPPATH=$6  # Sixth argument is full temp path during install (see also $1)

# Combine them with /etc/environment
PHTMLAUTH=$LBHOMEDIR/webfrontend/htmlauth/plugins/$PDIR
PHTML=$LBPHTML/$PDIR
PTEMPL=$LBPTEMPL/$PDIR
PDATA=$LBPDATA/$PDIR
PLOGS=$LBPLOG/$PDIR # Note! This is stored on a Ramdisk now!
PCONFIG=$LBPCONFIG/$PDIR
PSBIN=$LBPSBIN/$PDIR
PBIN=$LBPBIN/$PDIR

echo "<INFO> installing dependencies"
npm --prefix $PBIN ci --only=production

# Enable proxy mode for apache2
echo "<INFO> enabling proxy for apache"
ln -s ../mods-available/proxy.load $LBHOMEDIR/system/apache2/mods-enabled/proxy.load
ln -s ../mods-available/proxy_http.load $LBHOMEDIR/system/apache2/mods-enabled/proxy_http.load

echo "<INFO> reloading apache"
sudo systemctl reload apache2

echo "<INFO> starting services"
npm --prefix $PBIN run start
npm --prefix $PBIN run manager:start

exit 0;