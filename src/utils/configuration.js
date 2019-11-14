require('dotenv').config();

export default class Configuration {
    static isValid() {
        return (
            process.env.SF_USERNAME &&
            process.env.SF_PASSWORD &&
            process.env.SF_TOKEN &&
            process.env.SF_LOGIN_URL
        );
    }

    static getSfLoginUrl() {
        return process.env.SF_LOGIN_URL;
    }

    static getSfUsername() {
        return process.env.SF_USERNAME;
    }

    static getSfSecuredPassword() {
        return process.env.SF_PASSWORD + process.env.SF_TOKEN;
    }

    static isMockTrain() {
        return (
            process.env.MOCK_TRAIN &&
            process.env.MOCK_TRAIN.toLowerCase() === 'true'
        );
    }

    static getMockHostname() {
        return process.env.MOCK_HOSTNAME;
    }
}
