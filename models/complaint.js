const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema ({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  body: { 
    type: String, 
    required: true, 
    trim: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['open','approved','completed'], 
    default: 'open' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);