const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  price: {
    type: Schema.Types.Number,
    required: true
  },
  discountedPrice: {
    type: Schema.Types.Number,
    required: true
  },
  images: [
    {
      filename:{
        type: Schema.Types.String,
        required: true,
      },
      path:{
        type: Schema.Types.String,
        required: true,
      }
    }
  ],
  modelName: {
      type: Schema.Types.String,
      required: true,
  },
  designer: {
    type: Schema.Types.String,
    required: true
  },
  category: {
    type: Schema.Types.String,
    required: true
  },
  sizeGuide: {
    type: Schema.Types.String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  urlSlug: {
    type: Schema.Types.String,
    required: true
  },
  sizes: [
    {
      size: {
        type: Schema.Types.String,
        required: true
      },
      remaining: {
        type: Schema.Types.String,
        required: true
      }
    }
  ],
  createdAt: {
    type: Schema.Types.Date,
    required: true
  },
  draft: {
    type: Schema.Types.Boolean,
    required: true
  },
  deleted: {
    type: Schema.Types.Boolean,
    required: true
  }
})

ProductSchema.index({modelName: 'text'});

module.exports = mongoose.model('Product', ProductSchema)