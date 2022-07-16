const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  name: {
    type: Schema.Types.String,
    require: true
  },
  surname: {
    type: Schema.Types.String,
    required: true
  },
  number: {
    type: Schema.Types.Number,
    required: true,
    unique: true
  },
  country: {
    type: Schema.Types.String,
    required: true,
  },
  email: {
      type: Schema.Types.String,
      required: true,
      unique: true
  },
  moneyBrought: {
    type: Schema.Types.Number,
    required: true
  },
  createdAt: {
    type: Schema.Types.Date,
    required: true
  },
  verified: {
    type: Schema.Types.Boolean,
    required: true
  },
  admin: {
    type: Schema.Types.Boolean,
    required: true
  }
})

// UserSchema.index({name: 'text', surname: 'text', email: 'text', country: 'text'});
UserSchema.index(
  { createdAt: 1 },
  {
      expireAfterSeconds: 10*60,
      partialFilterExpression: { verified: false }
  }
)

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email', errorMessages: {
  UserExistsError: 'A user with the given email is already registered'
} });

module.exports = mongoose.model('User', UserSchema)