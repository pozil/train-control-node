export default class ByteUtils {

  /**
   * Encodes a locomotive adress
   * @param {number} address locomotive address
   */
  static encodeLocoAddress(address) {
    if (address < 100) {
      return [0x00, address & 0x7F];
    }
    throw new Error('Support for locomotive address > 99 not implemented');
  }

  // Pass a value, get an array back.
  // E.g. `6000` will be returned as `[01110000, 00101110]`
  static toLowAndHighBits(value) {
    return [value & 0x7F, (value >> 7) & 0x7F];
  }

  // Pass an array, get an value back.
  // E.g. `[01110000, 00101110]` will be returned as `6000`
  static fromLowAndHighBits(data) {
    return ((data[1] << 7) + data[0]) & 0x7F7F;
  }

  // Pass an array, get an value back.
  // E.g. `[01110000, 00010111]` will be returned as `6000`
  static fromLowAndHigh8Bits(data) {
    return ((data[1] << 8) + data[0]) & 0xFFFF;
  }

  static compareByteArrays(arr1, arr2) {
    let result = true;
    arr1.forEach((value, index) => {
      if (arr2[index] != value) {
        result = false;
      }
    });
    return result;
  }

  static bytesToString(bytes) {
    let output = '';
    bytes.forEach(byte => {
      output += '0x' + byte.toString(16).toUpperCase() + ' ';
    });
    return output.substring(0, output.length - 1);
  }
}