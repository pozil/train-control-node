import HornbyDriver from '../src/devices/hornbyDriver';
import HornbyConstants from '../src/devices/hornbyConstants';
const SerialPort = require('serialport/test'),
  MockBinding = SerialPort.Binding;

const MOCK_PORT_PATH = '/dev/testMock';

describe('Hornby Driver', () => {

    const getMockReturningPromise = returnValue => {
        const mock = jest.fn();
        mock.mockReturnValue(new Promise(resolve => resolve(returnValue)));
        return mock;
    }

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('connects', () => {             
        MockBinding.createPort(MOCK_PORT_PATH, { echo: false, record: false });
        
        const driver = new HornbyDriver();
        driver._findPort = getMockReturningPromise({ comName: MOCK_PORT_PATH });

        return new Promise(resolve => {
            driver.connect().then(() => {
                expect(driver._findPort).toHaveBeenCalled();
                MockBinding.reset();
                resolve();
            });
        });
    });

    it('disconnects', () => {
        const driver = new HornbyDriver();
        driver.port = {
            close: jest.fn(callback => callback())
        };

        return new Promise(resolve => {
            driver.disconnect().then(() => {
                expect(driver.port.close).toHaveBeenCalled();
                resolve();
            });
        });
    });

    describe('setTrainThrottle', () => {

        it('throws error for speed < 0', () => {
            const driver = new HornbyDriver();
            return expect(driver.setTrainThrottle(3, -1)).rejects.toEqual(new Error('Speed -1 is out of range [0-127]'));
        });

        it('throws error for speed > 127', () => {
            const driver = new HornbyDriver();
            return expect(driver.setTrainThrottle(3, 128)).rejects.toEqual(new Error('Speed 128 is out of range [0-127]'));
        });

        it('accelerates forward', () => {
            const driver = new HornbyDriver();
            driver._addParity = jest.fn();
            driver._write = getMockReturningPromise();
    
            return new Promise(resolve => {
                driver.setTrainThrottle(3, 100).then(() => {
                    expect(driver._addParity).toHaveBeenCalled();
                    expect(driver._write).toHaveBeenCalled();
                    resolve();
                });
            });
        });

        it('accelerates backward', () => {
            const driver = new HornbyDriver();
            driver._addParity = jest.fn();
            driver._write = getMockReturningPromise();
    
            return new Promise(resolve => {
                driver.setTrainThrottle(3, 100, false).then(() => {
                    expect(driver._addParity).toHaveBeenCalled();
                    expect(driver._write).toHaveBeenCalled();
                    resolve();
                });
            });
        });
    });

    it('stops', () => {
        const driver = new HornbyDriver();
        driver.setTrainThrottle = getMockReturningPromise();

        return new Promise(resolve => {
            driver.stopTrain(4).then(() => {
                expect(driver.setTrainThrottle).toHaveBeenCalled();
                expect(driver.setTrainThrottle.mock.calls[0][0]).toBe(4);
                resolve();
            });
        });
    });

    describe('_findPort', () => {
        it('finds the port', () => {
            const driver = new HornbyDriver();
            SerialPort.list = getMockReturningPromise([
                {comName: MOCK_PORT_PATH, vendorId: HornbyConstants.VENDOR_ID}
            ]);

            return new Promise(resolve => {
                driver._findPort().then(port => {
                    expect(SerialPort.list).toHaveBeenCalled();
                    expect(port.comName).toBe(MOCK_PORT_PATH);
                    resolve();
                });
            });
        });

        it('fails to finds the port', () => {
            const driver = new HornbyDriver();
            SerialPort.list = getMockReturningPromise([]);

            expect(driver._findPort()).rejects.toThrow(/not find/);
        });
    })
});