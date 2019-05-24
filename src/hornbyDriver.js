const Winston = require('winston'),
    SerialPort = require('serialport');

import HornbyConstants from './hornbyConstants';
import ByteUtils from './byteUtils';

// Configure logs
Winston.loggers.add('Hornby', {
    console: { level: 'info', colorize: true, label: 'Hornby' }
});
const LOG = Winston.loggers.get('Hornby');

export default class HornbyDriver {
    constructor() {
        this.port = null;
    }

    connect() {
        return this._findPort().then(portData => {
            return new Promise((resolve, reject) => {
                this.port = new SerialPort(portData.comName, { baudRate: HornbyConstants.BAUD_RATE, autoOpen: false });
                LOG.debug('Connecting...');
                this.port.open(error => {
                    if (error) {
                        LOG.error('Failed to open port', error);
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
    setTrainThrottle(locoAddress, speed, isForward=true) {
        LOG.debug(`Train ${locoAddress}: speed=${speed}`);
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
    stopTrain(locoAddress) {
        return this.setTrainThrottle(locoAddress, 0);
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            LOG.debug('Disconnecting...');
            this.port.close(error => {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    }

    _write(message) {
        return this._checkConnection()
            .then(() => {
                //LOG.debug('Writing', ByteUtils.bytesToString(message));
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
    _findPort() {
        LOG.debug('Searching for port...');
        return SerialPort.list().then(ports => {
            LOG.debug('Listing available ports:', ports);
            return new Promise((resolve, reject) => {
                const port = ports.find(port => port.vendorId === HornbyConstants.VENDOR_ID);
                if (!port) {
                    return reject(new Error('Did not find serial port with expected vendor id: ' + HornbyConstants.VENDOR_ID));
                }
                LOG.debug('Found port:', port);
                return resolve(port);
            });
        });
    }

    _checkConnection() {
        return new Promise((resolve, reject) => {
            if (this.port === null || !this.port.binding.isOpen) {
                const message = 'Cannot issue command, SerialPort is not connected';
                LOG.error(message);
                return reject(new Error(message));
            }
            return resolve();
        });
    }
}