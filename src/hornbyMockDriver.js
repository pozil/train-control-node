const Winston = require('winston');
import HornbyDriver from './hornbyDriver';

// Configure logs
Winston.loggers.add('Hornby', {
    console: { level: 'info', colorize: true, label: 'Hornby' }
});
const LOG = Winston.loggers.get('Hornby');

export default class HornbyMockDriver extends HornbyDriver {
    constructor() {
        super();
    }

    connect() {
        return new Promise(resolve => resolve());
    }

    setTrainThrottle(locoAddress, speed, isForward=true) {
        LOG.debug(`Train ${locoAddress}: speed=${speed}`);
        return new Promise(resolve => resolve());
    }

    disconnect() {
        return new Promise(resolve => resolve());
    }
}