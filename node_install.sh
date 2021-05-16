if [ "$#" -lt 1 ]; then
    echo "node current will be installed(default)"
    echo "to change version, source ./node_install.sh [main version number/lts/current]"
    v="current"
else
    echo "node $1.x will be installed"
    v=$1
fi



apt install -y curl
curl -sL https://deb.nodesource.com/setup_$v.x | bash -
apt-get install -y nodejs

