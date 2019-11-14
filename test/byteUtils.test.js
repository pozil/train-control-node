import ByteUtils from '../src/devices/byteUtils';

describe('ByteUtils functions', () => {

    describe('encodeLocoAddress', () => {
        it('encodes loco 75 correctly', () => {
            const out = ByteUtils.encodeLocoAddress(75);
            expect(out).toEqual([0x00, 0x4B]);
        });

        it('encodes loco 99 correctly', () => {
            const out = ByteUtils.encodeLocoAddress(99);
            expect(out).toEqual([0x00, 0x63]);
        });

        it('fails to encode loco adress 100', () => {
            expect(() => {
                ByteUtils.encodeLocoAddress(100);
            }).toThrow(/not implemented/);
        });
    });

    describe('toLowAndHighBits', () => {
        it('splits low and high bits for value < 254', () => {
            const out = ByteUtils.toLowAndHighBits(10);
            expect(out).toEqual([10, 0]);
        });
    
        it('splits low and high bits for value > 254', () => {
            const out = ByteUtils.toLowAndHighBits(6000);
            expect(out).toEqual([0x70, 0x2E]);
        });
    });

    describe('fromLowAndHighBits', () => {
        it('joins low and high bytes for value < 254', () => {
            const out = ByteUtils.fromLowAndHighBits([ 10, 0 ]);
            expect(out).toEqual(10);
        });
    
        it('joins low and high bytes for value > 254', () => {
            const out = ByteUtils.fromLowAndHighBits([ 0x70, 0x2E ]);
            expect(out).toEqual(6000);
        });
    });

    describe('fromLowAndHigh8Bits', () => {
        it('joins low and high bytes for 8 bit value < 254', () => {
            const out = ByteUtils.fromLowAndHigh8Bits([ 10, 0 ]);
            expect(out).toEqual(10);
        });
    
        it('joins low and high bytes for 8 bit value > 254', () => {
            const out = ByteUtils.fromLowAndHigh8Bits([ 0x70, 0x17 ]);
            expect(out).toEqual(6000);
        });
    });

    describe('compareByteArrays', () => {
        it('matches', () => {
            const bytes = [0x01, 0xA1];
            const isMatch = ByteUtils.compareByteArrays(bytes, bytes);
            expect(isMatch).toBeTruthy();
        });

        it('does not match', () => {
            const a = [0x01, 0xA1];
            const b = [0x01, 0xA2];
            const isMatch = ByteUtils.compareByteArrays(a, b);
            expect(isMatch).toBeFalsy();
        });
    });

    describe('bytesToString', () => {
        it('converts bytes to string', () => {
            const bytes = [0x01, 0xA1];
            const bytesAsString = ByteUtils.bytesToString(bytes);
            expect(bytesAsString).toEqual('0x1 0xA1');
        });
    });
});