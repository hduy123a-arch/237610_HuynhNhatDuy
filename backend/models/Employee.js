const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, trim: true },
  fullName:   { type: String, required: true, trim: true },
  gender: String,
  dateOfBirth: String,
  department: String,
  position: String,
  email: { type: String, required: true, trim: true },
  phone: String,
  hireDate: String,
  status: { type: String, default: 'Đang làm việc' },
}, { collection: 'employees', timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
