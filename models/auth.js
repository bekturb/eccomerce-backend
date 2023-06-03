const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);
function validateAuth(req) {
    const schema = Joi.object({
        email:  Joi.string().required(),
        password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .onlyLatinCharacters()
            .required(),
    });
    return schema.validate(req);
}

exports.validate = validateAuth;