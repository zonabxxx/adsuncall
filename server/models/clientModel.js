const mongoose = require('mongoose');

const clientSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a client name'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    company: {
      type: String,
    },
    notes: {
      type: String,
    },
    web: {
      type: String,
    },
    mail: {
      type: String,
    },
    postal_mail: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isClient: {
      type: Boolean,
      default: false,
    },
    clientSince: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Client', clientSchema); 