const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    }
});

// Check if the model already exists to prevent OverwriteModelError
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

module.exports = Counter;
