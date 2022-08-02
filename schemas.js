const BaseJoi = require('joi');

const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not incluse HTML tags',
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                })
                if(clean !== value) {
                    return helpers.error('string.escapeHTML', { value });
                }
                return clean;
            }
            
        }
    }
})

const Joi = BaseJoi.extend(extension);

module.exports.userSchema = Joi.object({
  name: Joi.string().required().max(30).escapeHTML(),
  surname: Joi.string().required().max(40).escapeHTML(),
  number: Joi.string()
    .regex(/^[0-9]{10}$/)
    .messages({ "string.pattern.base": `Phone number must have 10 digits.` })
    .required()
    .escapeHTML(),
  email: Joi.string().email().required().max(50).escapeHTML(),
  password: Joi.string().required().max(40).escapeHTML(),
});
module.exports.userChangesSchema = Joi.object({
  name: Joi.string().required().max(30).escapeHTML(),
  surname: Joi.string().required().max(40).escapeHTML(),
  number: Joi.string()
    .regex(/^[0-9]{10}$/)
    .messages({ "string.pattern.base": `Phone number must have 10 digits.` })
    .required()
    .escapeHTML(),
  email: Joi.string().email().required().max(50),
});

const validPaymentMethod = [
  "card",
  "cash-on-delivery"
]
module.exports.checkoutSchema = Joi.object({
  name: Joi.string().required().max(30).escapeHTML(),
  surname: Joi.string().required().max(40).escapeHTML(),
  number: Joi.string()
    .regex(/^[0-9]{10}$/)
    .messages({ "string.pattern.base": `Phone number must have 10 digits.` })
    .required()
    .escapeHTML(),
  address: Joi.string().required().max(50).escapeHTML(),
  zip: Joi.string().required().length(5).escapeHTML(),
  city: Joi.string().required().max(50).escapeHTML(),
  province: Joi.string().required().max(50).escapeHTML(),
  paymentMethod: Joi.string().valid(...validPaymentMethod).required()
});
module.exports.emailSchema = Joi.object({
  email: Joi.string().email().required().max(50).escapeHTML(),
});