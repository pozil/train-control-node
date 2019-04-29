const NanoTimer = require('nanotimer');
const Winston = require('winston');

const LOG = Winston.loggers.get('App');

/**
 * Wait a number of seconds
 * @param {number} seconds 
 */
export async function sleep(seconds) {
  return new Promise(resolve => {
    LOG.debug(`Sleep ${seconds}s`);
    const timer = new NanoTimer();
    timer.setTimeout(() => resolve(seconds), '', `${seconds}s`);
    timer.clearInterval();
  });
}

/**
 * Wait a number of microseconds
 * @param {number} microseconds 
 */
export async function usleep(micros) {
  return new Promise(resolve => {
    LOG.debug(`Sleep ${micros}u`);
    const timer = new NanoTimer();
    timer.setTimeout(() => resolve(micros), '', `${micros}u`);
    timer.clearInterval();
  });
}
