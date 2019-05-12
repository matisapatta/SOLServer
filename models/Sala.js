const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
  capacity: {
    type: Number,
    required: true,
  },
  guitar: {
    type: String,
    required: true
  },
  bass: {
    type: String,
    required: true
  },
  drums: {
    type: String,
    required: true
  },
})

const salaSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  mainimage: {
    type: String,
    default: 'n/a'
  },
  images:[String],
  rooms: [roomSchema],
  ownerId: {
    type: String,
    required: true
  }
}, { timestamps: true })

const Sala = mongoose.model('Sala', salaSchema);

module.exports = { Sala };
