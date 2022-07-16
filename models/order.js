const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      },
      price: {
        type: Schema.Types.Number,
        required: true
      },
      copies: {
        type: Schema.Types.Number,
        required: true
      },
      size: {
        type: Schema.Types.String,
        required: true
      }
    }
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  suuid: {
    type: Schema.Types.String,
    required: true
  },
  cashOnDelivery: {
    type: Schema.Types.Boolean,
    required: true
  },

  state: {
    type: Schema.Types.String,
    required: true,
  },
  email: {
    type: Schema.Types.String,
    required: true,
  },
  number: {
    type: Schema.Types.Number,
    required: true,
  },
  zip: {
    type: Schema.Types.String,
    required: true,
  },
  province: {
    type: Schema.Types.String,
    required: true,
  },
  name: {
    type: Schema.Types.String,
    required: true,
  },
  surname: {
    type: Schema.Types.String,
    required: true,
  },
  city: {
    type: Schema.Types.String,
    required: true,
  },
  address: {
    type: Schema.Types.String,
    required: true,
  },

  amount: {
    type: Schema.Types.Number,
    required: true,
  },
  piid: {
    type: Schema.Types.String,
    required: true,
  },
  paymentMethod: {
    type: Schema.Types.String,
    required: true,
  },

  completed: {
    type: Schema.Types.Boolean,
    required: true,
  },
  createdAt: {
      type: Schema.Types.Date,
      required: true,
  },
  coupon: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  }
})

OrderSchema.index(
  { createdAt: 1 },
  {
      expireAfterSeconds: 60*24*30*12,
  }
)

module.exports = mongoose.model('Order', OrderSchema)