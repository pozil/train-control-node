function TrainRestResource(app, apiRoot, driver) {
  this.driver = driver;
  const resourceUrl = apiRoot +'train';
  
  app.post(resourceUrl, (request, response) => {
    this.driver.stopTrain(3)
      .then(() => response.status(200).send({}))
      .catch(e => logAndReportError(response, 'Train.stop', e));
	});
}

export default TrainRestResource;

logAndReportError = (response, calledMethod, e) => {
  console.error(calledMethod, e.stack);
  response.status(500).json(e);
}
