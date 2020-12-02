const Constants = require( "../constants/Constants");
const crypto = require('crypto');
const moment = require('moment');
const Errors = require('../libs/errors/errors');
const PasswordReset = require('../models/passwordreset');

const BYTES_SIZE = 32;
const ENCODING = 'hex';

exports.hash = async (passwordStr = '') => {}

exports.checkReset = async (phoneNumber) => {
    let resetLog;

    try {
        resetLog = await this.findActiveResetRequest(phoneNumber);

        return !!resetLog;
    } catch (e) {
        throw e;
    }
}

exports.findActiveResetRequest = async (phoneNumber) => {
    let resetLog;

    try {
        resetLog = await PasswordReset.findOne({
            where: { phoneNumber, status: Constants.UNEXPIRED }
        });

        return resetLog;
    } catch (e) {
        throw e;
    }
}

exports.initReset = async (phoneNumber) => {
    try {
        let token = generateToken();
        await PasswordReset.create({
            phoneNumber,
            token,
            expiresIn: moment().add(2, 'h'),
            status: Status.UNEXPIRED
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

exports.reResetRequest = async (phoneNumber) => {
    try {
        let token = generateToken();
        let expiresIn = getExpirationTime();

        await updateRequest(phoneNumber, {token, expiresIn});
    } catch (e) {
        throw e;
    }
}

exports.reset = async (phoneNumber, hashedPassword) => {
    try {
        await updatePassword(phoneNumber, { password: hashedPassword });
    } catch (e) {
        throw e;
    }
}

async function updatePassword (phoneNumber, fields = {}) {
    try {
        await User.update(fields, {
            where: { phoneNumber },
        });
    } catch (err) {
        throw err;
    }
}

async function updateRequest (phoneNumber, fields = {}) {
    try {
        await PasswordReset.update(fields, {
            where: { phoneNumber },
        });
    } catch (err) {
        throw err;
    }
}

function generateToken(sizeInBits = BYTES_SIZE) {
    try {
        const cryptoBuff = crypto.randomBytes(BYTES_SIZE);
        return cryptoBuff.toString(ENCODING);

    } catch (error) {
        console.log(error);
        throw new Errors.GeneralError()
    }
}

function getExpirationTime(amount = 2, unit = 'h') {
    return moment().add(amount, unit);
}