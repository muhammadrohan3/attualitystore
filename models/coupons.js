const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CouponSchema = new Schema({
  discount: {
    type: Schema.Types.Number,
    required: true
  },
  used: {
    type: Schema.Types.Boolean,
    required: true
  }
})

module.exports = mongoose.model('Coupon', CouponSchema)