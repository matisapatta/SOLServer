const mongoose = require('mongoose');


const reservationSchema = mongoose.Schema({
    salaId:
    {
        type: String,
    },
    ownerId: {
        type: String
    },
    salaName: {
        type: String
    },
    salaAddress:{
        type: String
    },
    roomId: {
        type: String
    },
    day : {
        type: String
    },
    from: {
        type: String
    },
    hours: {
        type: Number
    },
    timestamp: {
        type: Date
    },
    userId: {
        type: String
    },
    paid: {
        type: Number
    },
    numberDay: {
        type: Number
    },
    cancelled: {
        type: Boolean
    },
    cancelledBy: {
        type: String
    },
    cancelledById: {
        type: String
    },
    reviewed: {
        type: Boolean
    },
    reviewedBy: {
        type: String
    },
    reviewedById: {
        type: String
    },
    closed : {
        type: Boolean
    },
    createdByVendor: {
        type: Boolean
    },
    createdByVendorData:{
        name:{
            type: String
        },
        email: {
            type: String
        }
    },
    location: {
        type: String
    }


}, { timestamps: true })

const Reservation = mongoose.model('Reservation', reservationSchema);

// Sala.createIndexes({ name: "text", location: "text" });
// db.salas.createIndex({name:"text",location:"text"})

module.exports = { Reservation };
