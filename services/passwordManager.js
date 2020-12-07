const Constants = require( "../constants/Constants");
const Status = require( "../constants/status");
const AccountManager = require("./accountManager");
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const Errors = require('../libs/errors/errors');
const PasswordReset = require('../models/passwordreset');
const User = require('../models/user');
const {Op} = require("sequelize");
const TimestampExpiration = require('../utils/timestampExpiration');

const BYTES_SIZE = 32;
const ENCODING = 'hex';

exports.hash = async (passwordStr = '') => {
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(passwordStr, 12);
        return hashedPassword;
    }catch (e) {
        throw e;
    }
}

exports.hasActiveResetRequest = async (phoneNumber) => {
    let resetLog;

    try {
        resetLog = await this.findResetRequestByPhoneNumberOrToken(phoneNumber);

        if(resetLog)
            return TimestampExpiration.check(resetLog.dataValues.expiresIn);
        return false;

    } catch (e) {
        throw e;
    }
}

exports.tokenIsExpired = async (token) => {
    return TimestampExpiration.check();
}

exports.findResetRequestByPhoneNumberOrToken = async ( phoneNumber = '', token = '' ) => {
    let resetLog;

    try {
        resetLog = await PasswordReset.findOne({
            where: {
                [Op.or]: [
                    { phoneNumber },
                    { token }
                ]
            }
        });

        return resetLog;
    } catch (e) {
        throw e;
    }
}

exports.findResetRequestByPhoneNumberAndToken = async (phoneNumber, token) => {
    let resetLog;

    try {
        resetLog = await PasswordReset.findOne({
            where: {
                [Op.and]: [
                    phoneNumber && { phoneNumber: phoneNumber },
                    token && { token: token}
                ]
            }
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

exports.reset = async (phoneNumber, token, hashedPassword) => {
    try {
        await updatePassword(phoneNumber, { password: hashedPassword });
    } catch (e) {
        throw e;
    }
}

async function updatePassword (phoneNumber, fields = {}) {
    try {
        await AccountManager.update(phoneNumber, fields);
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