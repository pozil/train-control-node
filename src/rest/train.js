import getLogger from '../utils/logger.js';
const logger = getLogger('REST');

function TrainRestResource(app, apiRoot, driver, sfdc) {
  this.driver = driver;
  this.sfdc = sfdc;
  const resourceUrl = `${apiRoot}train`;
  
  app.post(`${resourceUrl}/stop`, async (request, response) => {
    const sender = (request.body.sender) ? request.body.sender : 'sensor1';
    try {
      await this.driver.stopTrain(3);
      if (sender === 'sensor2') {
        await this.sfdc.publishEvent('Train_Payload_Delivered');
      }
      response.status(200).send({});
    } catch (e) {
      logger.error(`REST call failed: train/stop: ${JSON.stringify(e)}`);
      response.status(500).json(e);
    }
  });
  
  app.post(`${resourceUrl}/start`, async (request, response) => {
    try {
      await this.driver.setTrainThrottle(3, 127);
      response.status(200).send({});
    } catch (e) {
      logger.error(`REST call failed: train/start: ${JSON.stringify(e)}`);
      response.status(500).json(e);
    }
  });
}

export default TrainRestResource;
