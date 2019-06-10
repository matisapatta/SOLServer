const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema({
    ownerId: {
        type: String
    },
    roomId: {
        type: String
    },
    from: {
        type: String
    },
    hours: {
        type: String
    },
    userId: {
        type: String
    },
    paid: {
        type: Boolean
    }
})

const reservationsSchema = mongoose.Schema({
    salaId:
    {
        type: String,
        required: true
    },
    reservations: [{
        day: {
            type: String
        },
        reservation: [reservationSchema]
    }]

}, { timestamps: true })

const Reservations = mongoose.model('Reservation', reservationsSchema);

// Sala.createIndexes({ name: "text", location: "text" });
// db.salas.createIndex({name:"text",location:"text"})

module.exports = { Reservations };
