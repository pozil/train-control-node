require('dotenv').config();
const Winston = require('winston');
const express = require('express');

import SalesforcePlatform from './salesforce-platform';
import HornbyDriver from './hornbyDriver';
import HornbyMockDriver from './hornbyMockDriver';
import {sleep} from './sleep';
import TrainRestResource from './rest/train';

// Configure logs
Winston.loggers.add('App', {
    console: { level: 'info', colorize: true, label: 'App' }
});
const LOG = Winston.loggers.get('App');

Winston.default.transports.console.level='debug';
Winston.loggers.get('App').transports.console.level='debug';
Winston.loggers.get('Hornby').transports.console.level='debug';

const sfdc = new SalesforcePlatform('train');
const isMockTrain = process.env.isMockTrain && process.env.isMockTrain.toLowerCase() === 'true';
if (isMockTrain) {
  LOG.warn('Running mock train!');
}
const trainDriver = isMockTrain ? new HornbyMockDriver() : new HornbyDriver();


let isShuttingDown = false;
const shutdown = () => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C) or SIGTERM");
  // Stop train and disconnect
  Promise.all([
    sfdc.disconnect(),
    trainDriver.stopTrain(3).then(() => trainDriver.disconnect())
  ]).then(process.exit(0))
  .catch(error => {
    LOG.error(error);
    process.exit(-1);
  });
}

// Process hooks
process.on('warning', e => console.warn(e.stack));
process.on('unhandledRejection', (reason, p) => {
    LOG.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

const EVENT_TRAIN_START = 'Train_Start';
const EVENT_TRAIN_STOP = 'Train_Stop';


const onPlatformEvent = platformEvent => {
  // Process event
  const eventData = platformEvent.data.payload;
  switch (eventData.Event__c) {
    case EVENT_TRAIN_START:
      onTrainStart(eventData);
    break;
    case EVENT_TRAIN_STOP:
      onTrainStop(eventData);
    break;
  }
}

const onTrainStart = eventData => {
  trainDriver.setTrainThrottle(3, 127)
};

const onTrainStop = eventData => {
  trainDriver.stopTrain(3);
};

// Setup HTTP server
const app = express();
app.set('port', process.env.PORT || 8080);
// Setup REST resources
const apiRoot = '/api/';
new TrainRestResource(app, apiRoot, trainDriver);
// Start HTTP server
app.listen(app.get('port'), () => {
	console.log('Server started on port ' + app.get('port'));
});


/*
// PRODUCTION MODE
Promise.all([
  sfdc.init(onPlatformEvent),
  trainDriver.connect()
]).catch(error => {
  LOG.error(error);
});
*/

// TEST MODE
LOG.info('Starting test sequence');
trainDriver.connect()
  .then(() => trainDriver.setTrainThrottle(3, 127))
  .then(() => sleep(10))
  .then(() => trainDriver.stopTrain(3))
  .then(() => sleep(3))
  .then(() => trainDriver.disconnect())
  .catch(error => {
      LOG.error(error);
  });
