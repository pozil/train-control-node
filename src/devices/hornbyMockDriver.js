import HornbyDriver from './hornbyDriver';
import getLogger from '../utils/logger.js';

const logger = getLogger('MockTrain');

export default class HornbyMockDriver extends HornbyDriver {
    constructor() {
        super();
    }

    async connect() {
        logger.info('Connect');
        return Promise.resolve();
    }

    async setTrainThrottle(locoAddress, speed, isForward=true) {
        logger.info(`Train ${locoAddress}: speed=${speed}`);
        return Promise.resolve();
    }

    async disconnect() {
        logger.info('Disconnect');
        return Promise.resolve();
    }
}