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
  price: {
    type: Number
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
  address: {
    stringaddress: {
      type: String,
      required: true
    },
    lat: {
      type: String,
    },
    lng: {
      type: String,
    }
  },
  phoneNumber: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    required: true
  },
  mainimage: {
    type: String,
    default: 'n/a'
  },
  images: [{
    original: {
      type: String
    },
    thumbnail: {
      type: String
    }
  }],
  days: [{
    type: String
  }],
  open: [{
    day: {
      type: String
    },
    from: {
      type: String
    },
    to: {
      type: String
    },
  }],
  pricefrom: {
    type: Number
  },
  priceto: {
    type: Number
  },
  reviews: [{
    type: String
  }],
  score:{
    type: Number,
    default: 0
  },
  rooms: [roomSchema],
  ownerId: {
    type: String,
    required: true
  }
}, { timestamps: true })

const Sala = mongoose.model('Sala', salaSchema);
const Room = mongoose.model('Room', roomSchema);

Sala.createIndexes({ name: "text", location: "text" });
// db.salas.createIndex({name:"text",location:"text"})

module.exports = { Sala, Room };
