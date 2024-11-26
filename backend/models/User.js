const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  orgId: { type: String, default: null },
  userType: {
    type: String,
    required: true,
    enum: ['organizational user', 'guest'],
  },
  selectedOrganization: {
    type: String,
    required: function() { return this.userType === 'organizational user'; },
  },
  address: {
    type: String,
    required: function() { return this.userType === 'organizational user'; },
  },
  contactEmail: {
    type: String,
    required: function() { return this.userType === 'organizational user'; },
  },
  userFirstName: {
    type: String,
    required: true,
  },
  userLastName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userContactNumber: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
