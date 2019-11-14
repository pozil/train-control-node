const express = require('express'),
  bodyParser = require('body-parser');

import getLogger from './utils/logger.js';
import Configuration from './utils/configuration.js';
import { getHostname, getIp } from './utils/network.js';
import SalesforceClient from './utils/salesforceClient';
import HornbyDriver from './devices/hornbyDriver';
import HornbyMockDriver from './devices/hornbyMockDriver';
import TrainRestResource from './rest/train';
import { sleep } from './utils/sleep';

const EVENT_TRAIN_PAYLOAD_RECEIVED = 'Train_Payload_Received';
const EVENT_TRAIN_PAYLOAD_DELIVERED = 'Train_Payload_Delivered';

const logger = getLogger('App');

// Load and check config
if (!Configuration.isValid()) {
  logger.error(
      'Cannot start app: missing mandatory configuration. Check your .env file.'
  );
  process.exit(-1);
}

const trainDriver = Configuration.isMockTrain()
    ? new HornbyMockDriver()
    : new HornbyDriver();
const sfdc = new SalesforceClient();

// Node process hooks
process.on('warning', e => logger.warn(e.stack));
process.on('unhandledRejection', async (reason, p) => {
    logger.error(`'Unhandled Rejection at: Promise ${JSON.stringify(p)}`);
    if (reason) {
        logger.error('Reason: ', reason);
    }
    await shutdown();
    process.exit(-1);
});
process.once('SIGINT', async () => {
    logger.info('Gracefully shutting down from SIGINT (Ctrl-C)');
    await shutdown();
    process.exit(0);
});

async function shutdown() {
  try {
    await trainDriver.stopTrain(3);
    await trainDriver.disconnect();
  }
  catch (e) {}
}

async function startApp() {
    logger.info('Starting up');

    // Connect train
    await trainDriver.connect();

    // Connect to Salesforce
    try {
        await sfdc.connect();
    } catch (error) {
        logger.error('Failed to connect to Salesforce org ', error);
        process.exit(-1);
    }

    // Retrieve device
    const device = await sfdc.getDeviceFromHostname(getHostname());

    // Subscribe to robot platform event
    sfdc.subscribeToStreamingEvent('/event/Robot_Event__e', handleRobotEvent);

    // Update device IP
    sfdc.updateDeviceIp(device.Id, getIp());

    // Setup HTTP server
    const app = express();
    app.set('port', process.env.PORT || 8080);
    app.use(bodyParser.json());
    // Setup REST resources
    const trainRest = new TrainRestResource(trainDriver, sfdc, device);
    app.post(`/api/train/stop`, (request, response) => {
      trainRest.stopTrain(request, response);
    });
    app.post(`/api/train/start`, (request, response) => {
      trainRest.startTrain(request, response);
    });
    // Start HTTP server
    app.listen(app.get('port'), () => {
      logger.info(`HTTP server started on port ${app.get('port')}`);
    });
}


function handleRobotEvent(event) {
  logger.info(`Incoming robot event ${JSON.stringify(event)}`);
  const eventData = event.payload;
  switch (eventData.Event__c) {
    case EVENT_TRAIN_PAYLOAD_RECEIVED:
      onPayloadReceived();
    break;
    case EVENT_TRAIN_PAYLOAD_DELIVERED:
      onPayloadDelivered();
    break;
  }
}

async function onPayloadReceived() {
  await rainDriver.setTrainThrottle(3, 127);
}

async function onPayloadDelivered() {
  await sleep(4);
  await trainDriver.setTrainThrottle(3, 127);
}

startApp();
