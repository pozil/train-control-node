# Robotics Ridge - Train control Node app

## Setup instructions

### Driver installation
Raspberry Pi requires a special driver to properly interact with Hornby Elite controller.

Create this file:<br/>
`/etc/udev/rules.d/10-elite.rules`

Paste this in the file:<br/>
`ATTR{idVendor}=="04d8", ATTR{idProduct}=="000a", RUN+="/sbin/modprobe -q ftdi_sio vendor=0x04d8 product=0x000a"`


### App installation
Install with:<br/>
`npm install`

Edit and configure the `.env` file:
```
domain='https://test.salesforce.com'
callbackUrl='http://localhost:5000/'
consumerKey=''
consumerSecret=''
apiVersion='v45.0'

sfdcUsername=''
sfdcPassword=''

isMockTrain=false
```

Build with:<br/>
`npm run build`

Start with:<br/>
`npm start`
