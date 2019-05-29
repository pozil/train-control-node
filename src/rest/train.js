function TrainRestResource(app, apiRoot, driver, sfdc) {
  this.driver = driver;
  this.sfdc = sfdc;
  const resourceUrl = `${apiRoot}train`;
  
  app.post(`${resourceUrl}/stop`, (request, response) => {
    const sender = (request.body.sender) ? request.body.sender : 'sensor1';
    this.driver.stopTrain(3)
      .then(() => {
        if (sender === 'sensor2') {
          this.sfdc.publishEvent('Train_Payload_Delivered');
        }
      })
      .then(() => response.status(200).send({}))
      .catch(e => logAndReportError(response, 'train/stop', e));
  });
  
  app.post(`${resourceUrl}/start`, (request, response) => {
    this.driver.setTrainThrottle(3, 127)
      .then(() => response.status(200).send({}))
      .catch(e => logAndReportError(response, 'train/start', e));
	});
}

export default TrainRestResource;

logAndReportError = (response, calledMethod, e) => {
  console.error(calledMethod, e.stack);
  response.status(500).json(e);
}
