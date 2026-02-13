const mongoose = require('mongoose');

const userSchema = new mongoose.Schema ({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['resident','admin']
  },
  flatNo: { 
    type: String, 
    default: '' ,
  },
  maintenanceStatus: { 
        type: String, 
        enum: ['Paid', 'Pending'], 
        default: 'Pending' 
    },
  maintenancePaymentDate: {
        type: Date,
        default: null
    }
}, 
{ timestamps: true });



module.exports = mongoose.model('User', userSchema);