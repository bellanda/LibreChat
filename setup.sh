# Get the directory of this script:
BASE_DIR="$( cd "$( dirname "$0" )" >/dev/null 2>&1 && pwd )"
sudo cd $BASE_DIR

# Install MongoDB
wget https://repo.mongodb.org/apt/ubuntu/dists/noble/mongodb-org/8.0/multiverse/binary-amd64/mongodb-org-server_8.0.9_amd64.deb
sudo dpkg -i mongodb-org-server_8.0.9_amd64.deb
rm mongodb-org-server_8.0.9_amd64.deb
sudo service mongod start

# Install dependencies
bun i

# Build packages
cd packages/mcp && bun install pkce-challenge
cd $BASE_DIR
bun run build:data-provider
bun run build:mcp
bun run build:data-schemas
cd client
bun run build
cd $BASE_DIR
