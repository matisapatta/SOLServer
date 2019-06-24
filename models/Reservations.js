const mongoose = require('mongoose');

// const reservationSchema = mongoose.Schema({
//     ownerId: {
//         type: String
//     },
//     roomId: {
//         type: String
//     },
//     day : {
//         type: String
//     },
//     from: {
//         type: String
//     },
//     hours: {
//         type: String
//     },
//     userId: {
//         type: String
//     },
//     paid: {
//         type: Boolean
//     },
//     // code: {
//     //     type: String
//     // }
// })

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
        type: String
    },
    userId: {
        type: String
    },
    paid: {
        type: Boolean
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
    }


}, { timestamps: true })

const Reservation = mongoose.model('Reservation', reservationSchema);

// Sala.createIndexes({ name: "text", location: "text" });
// db.salas.createIndex({name:"text",location:"text"})

module.exports = { Reservation };
