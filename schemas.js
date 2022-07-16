const Joi = require('joi');

module.exports.userSchema = Joi.object({
    name: Joi.string().required().max(20),
    surname: Joi.string().required().max(20),
    number: Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
    email: Joi.string().email().required().max(40),
    password: Joi.string().required().max(40),
})

module.exports.userChangesSchema = Joi.object({
    name: Joi.string().required().max(20),
    surname: Joi.string().required().max(20),
    number: Joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
    email: Joi.string().email().required().max(40)
})