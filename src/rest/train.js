import getLogger from '../utils/logger.js';
const logger = getLogger('REST');

export default class TrainRestResource {
  constructor(driver, sfdc, device) {
    this.driver = driver;
    this.sfdc = sfdc;
    this.device = device;
  }

  async stopTrain(request, response) {
    logger.info('Stop train');
    const sender = (request.body.sender) ? request.body.sender : 'sensor1';
    try {
      await this.driver.stopTrain(3);
      if (sender === 'sensor2') {
        await this.sfdc.publishPlatformEvent({
          Event__c: 'Train_Payload_Delivered',
          Device_Id__c: this.device.Id,
          Feed_Id__c: this.device.Feed__c
        });
      }
      response.status(200).send({});
    } catch (e) {
      logger.error(`REST call failed: train/stop: ${JSON.stringify(e)}`);
      response.status(500).json(e);
    }
  }

  async startTrain(request, response) {
    logger.info('Start train');
    try {
      await this.driver.setTrainThrottle(3, 127);
      response.status(200).send({});
    } catch (e) {
      logger.error(`REST call failed: train/start: ${JSON.stringify(e)}`);
      response.status(500).json(e);
    }
  }
}
