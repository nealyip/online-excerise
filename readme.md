## Quick Start ##
Copy the .env.example to .env  
And fill in the GCP_API_KEY inside the file.  
Change the db password if necessary.  

To start to build the app  
use the following command  
```
docker-compose build web1
docker-compose up
```

To rebuild source files only  
```docker
docker-compose build web1
docker-compose up -d web1
```

To force rebuild after any dependencies update from the source files in the server directory  
```docker
docker-compose up --build -V
```

After the docker-compose completes, all the required initialization should have been done.  
The server will listen to port 8080  

To run a simple integration test, execute  
```npm
npm i
npm run test
```
from the root folder.  

## Unit tests ##
Unit tests for the server scripts that can be done by executing  
```npm
npm i
npm run test
```
from the server directory  
