const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true
  },

  remark: {
    type: String
  },

  assignTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  },
  assingBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  },
  dueDate: {
    type: Date
  },

  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Archived'],
    default: 'Pending'
  },

},{ timestamps: true,versionKey: false });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
