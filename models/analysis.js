const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalysisSchema = new Schema({
  cookieID: {
    type: Schema.Types.String,
    required: true
  },
  referrer: {
    type: Schema.Types.String,
    required: true
  },
  country: {
    type: Schema.Types.String,
    required: true
  },
  landingPage: {
    type: Schema.Types.String,
    required: true
  },
  device: {
    type: Schema.Types.String,
    required: true
  },
  createdAt: {
    type: Schema.Types.String,
    required: true
  },
})

AnalysisSchema.index(
  { createdAt: 1 },
  {
      expireAfterSeconds: 10,
  }
)

module.exports = mongoose.model('Analysis', AnalysisSchema)