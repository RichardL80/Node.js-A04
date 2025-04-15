const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: String,
  message: String,
  submittedAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
