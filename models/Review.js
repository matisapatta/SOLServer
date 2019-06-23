const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    salaId: {
        type: String
    },
    reservationId: {
        type: String
    },
    reviewer: {
        type: String
    },
    score: {
        type: Number
    },
    reviewText: {
        type: String
    },
    location: {
        type: String
    },
}, { timestamps: true })

const Review = mongoose.model('Review', reviewSchema);

module.exports = { Review }