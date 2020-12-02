const PasswordReset = require('../models/passwordreset');

exports.hash = async () => {}

exports.checkReset = async (phoneNumber) => {
    let resetLog;

    try {
        resetLog = await PasswordReset.findOne({
            where: { phoneNumber }
        });

        if(resetLog) {

        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.initReset = async () => {}

exports.reset = async () => {}