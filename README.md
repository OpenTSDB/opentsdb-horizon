OpenTSDB Horizon
================
A standalone UI for rich observability visualization. Out of the box, we support 
dashboards and alerts with an emphasis on performance. Horizon integrates easily 
with the Opentsdb observability stack. You may also write your own plugins to 
connect to additional datasources.

## Installation Guide

### 1. Download Dependencies

#### for Mac Machine
```
  Install Node from: https://nodejs.org/en/
  npm install node-sass grunt-sass
```

### 2. Install Horizon Frontend
```  
  cd horizon/frontend
  npm install
```

### 3. Install Horizon Server
```  
  cd horizon/server
  npm install
```

### 4. Install Certificates

#### Generate self signed certificates
```
mkdir ~/.ssh/opentsdb
cd ~/.ssh/opentsdb

openssl genrsa -out dev.opentsdb.key 2048
openssl rsa -in dev.opentsdb.key -out dev.opentsdb.key
openssl req -sha256 -new -key dev.opentsdb.key -out dev.opentsdb.csr -subj '/CN=dev.opentsdb.net'
openssl x509 -req -sha256 -days 3650 -in dev.opentsdb.csr -signkey dev.opentsdb.key -out dev.opentsdb.crt

sudo chown -R <userid>:staff ${HOME}/.ssh/opentsdb
```

### 5. Start application - this requires 2 terminals to be opened at the same time.
```
  #terminal 1:
  cd frontend
  npm start

  #terminal 2
  cd server
  npm start
```

### 6. Visit local Horizon
```
  https://dev.opentsdb.net:4443/
```

Note: In Chrome, you may have to type `thisisunsafe` to bypass HSTS security warning.

### 7. App config

| Field   |Type         |Description |
|----------|-------------|:-----------|
| readonly |  boolean | turns the dashboard into readonly mode. Disables other modules. |
| auth |  object   |   Auth configuration<br><pre>"auth": {<br>  "loginURL": "/login", // Login URL where the user needs to be redirected in case of session expiry. <br>  "heartbeatURL": "/heartbeat", // URL where the heartbeat needs to be checked; auth cookie refresh logic can be added here. <br>  "heartbeatImgURL": "/heartbeatimg", // Optional. If heartbeat fails, this URL tries to refreshes the cookie through img.src since it follows the url redirect.  <br>  "heartbeatInterval": 600, // interval(secs) to check the heartbeat.<br>}</pre> |

Contribute
----------

Please see the [Contributing](contributing.md) file for information on how to
get involved. We welcome issues, questions, and pull requests.

Maintainers
-----------

* Hill Nguyen
* Chris Esler
* Syed Abuthahir Sait Seenipeer

License
-------

This project is licensed under the terms of the Apache 2.0 open source license.
Please refer to [LICENSE](LICENSE.md) for the full terms.
