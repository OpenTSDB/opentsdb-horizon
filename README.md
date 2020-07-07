# horizon
Horizon - a standalone UI for rich observability visualization. Out of the box, we support dashboards and alerts with an emphasis on performance. Horizon integrates easily with the Yamas observability stack. You may also write your own plugins to connect to your own datasources.

## Contribution

1. Fork [Horizon](https://github.com/VerizonMediaPrivate/horizon)
2. Create a new branch my-new-feature
3. Make the desired changes and push the code changes to your repository
4. Create to PR to [Dev Branch](https://github.com/VerizonMediaPrivate/horizon/tree/master)

## Installation Guide

### 1. Download Dependencies

#### Option 1: for Verizon Media Virtual Machines
```
  yinst install ynodejs_core -br current
  yinst install ynpm -br current
  sudo npm install -g yo generator-angular bower grunt
  npm install node-sass grunt-sass
```

#### Option 2: for Mac Machine
```
  Install Node from: https://nodejs.org/en/
  npm install node-sass grunt-sass
```

### 2. (Optional) Set npm registry to Verizon Media Builders
```  
  cd horizon
  npm set registry https://registry.npm.vzbuilders.com:4443/npm-registry
```

### 3. Install Horizon Frontend
```  
  cd horizon/frontend
  npm install
```

### 4. Install Horizon Server
```  
  cd horizon/server
  npm install
```

### 5. Install Certificates

#### Generate self signed certificates
```
mkdir ~/.ssh/yamas
cd ~/.ssh/yamas

openssl genrsa -out dev.yamas.key 2048
openssl rsa -in dev.yamas.key -out dev.yamas.key
openssl req -sha256 -new -key dev.yamas.key -out dev.yamas.csr -subj '/CN=dev.yamas.ouroath.com'
openssl x509 -req -sha256 -days 3650 -in dev.yamas.csr -signkey dev.yamas.key -out dev.yamas.crt

sudo chown -R <userid>:staff ${HOME}/.ssh/yamas
```

#### Intercept Okta Cookies (for backend authentication)
Make a \*.ouroath.com domain reference in your /etc/hosts file:

```
  sudo bash -c 'echo "127.0.0.1 dev.yamas.ouroath.com" >> /private/etc/hosts'
```

### 6. Start application - this requires 2 terminals to be opened at the same time.
```
  #terminal 1:
  cd frontend
  npm start

  #terminal 2
  cd server
  npm start
```

### 7. Login to Yamas prod (to get Okta cookies)
```
  https://yamas.ouroath.com/

```
### 8. Visit local Horizon
```
  https://dev.yamas.ouroath.com:4443/
```

Note: In Chrome, you may have to type `thisisunsafe` to bypass HSTS security warning.