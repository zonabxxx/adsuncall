const mongoose = require('mongoose');

const callSchema = mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Client',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    callDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Failed'],
      default: 'Scheduled',
    },
    duration: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    outcome: {
      type: String,
      enum: ['Success', 'Need Follow-up', 'No Answer', 'Not Interested', 'Other'],
    },
    nextAction: {
      type: String,
    },
    nextActionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Call', callSchema); 