const SerialPort = require('serialport');
import getLogger from '../utils/logger.js';
import HornbyConstants from './hornbyConstants';
import ByteUtils from './byteUtils';

const logger = getLogger('Train');

export default class HornbyDriver {
    constructor() {
        this.port = null;
    }

    async connect() {
        return this._findPort().then(portData => {
            return new Promise((resolve, reject) => {
                this.port = new SerialPort(portData.comName, { baudRate: HornbyConstants.BAUD_RATE, autoOpen: false });
                logger.debug('Connecting...');
                this.port.open(error => {
                    if (error) {
                        logger.error('Failed to open port', error);
                        return reject(error);
                    }
                    return resolve();
                });
            });
        });
    }

    /**
     * Controls a locomotive's throttle
     * @param {number} locoAddress 
     * @param {number} speed 
     * @param {boolean} isForward - optional direction (default: forward)
     */
    async setTrainThrottle(locoAddress, speed, isForward=true) {
        logger.debug(`Train ${locoAddress}: speed=${speed}`);
        if (speed < 0 || speed > 127) {
            throw new Error(`Speed ${speed} is out of range [0-127]`);
        }
        let throttle = speed;
        if (isForward) {
            throttle |= 0x80;
        } else {
            throttle |= 0x7F;
        }

        const message = [ HornbyConstants.CMD_THROTTLE, HornbyConstants.CMD_THROTTLE_128 ];
        message.push(...ByteUtils.encodeLocoAddress(locoAddress));
        message.push(throttle);
        this._addParity(message);
        return this._write(message);
    }

    /**
     * Shorthand method for stopping a locomotive.
     * Equivalent to setTrainThrottle with speed=0
     * @param {number} locoAddress 
     */
    async stopTrain(locoAddress) {
        return this.setTrainThrottle(locoAddress, 0);
    }

    async disconnect() {
        return new Promise((resolve, reject) => {
            logger.debug('Disconnecting...');
            this.port.close(error => {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    }

    async _write(message) {
        return this._checkConnection()
            .then(() => {
                //logger.debug('Writing', ByteUtils.bytesToString(message));
                return new Promise((resolve, reject) => {
                    this.port.write(message, error => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve();
                    });
                });
            });
    }

    _addParity(message) {
        let lrc = 0;
        message.forEach(b => {
            lrc ^= b;
        });
        message.push(lrc);
    }

    /**
     * Finds the serial port associated with the Hornby controller
     */
    async _findPort() {
        logger.debug('Searching for port...');
        return SerialPort.list().then(ports => {
            logger.debug('Listing available ports:', ports);
            return new Promise((resolve, reject) => {
                const port = ports.find(port => port.vendorId === HornbyConstants.VENDOR_ID);
                if (!port) {
                    return reject(new Error('Did not find serial port with expected vendor id: ' + HornbyConstants.VENDOR_ID));
                }
                logger.debug('Found port:', port);
                return resolve(port);
            });
        });
    }

    async _checkConnection() {
        return new Promise((resolve, reject) => {
            if (this.port === null || !this.port.binding.isOpen) {
                const message = 'Cannot issue command, SerialPort is not connected';
                logger.error(message);
                return reject(new Error(message));
            }
            return resolve();
        });
    }
}