const userModel = require('../model/userModel');
const taskModel = require('../model/taskModel');

const axios = require('axios')
const csv = require('csvtojson')

exports.createTask = async (req, res) => {
  console.log("req.user",req.user);
  console.log("req.body",req.body);
  try {
     
      const { taskName, dueDate, assignTo, remark } = req.body;
      // console.log("<><>>>>>>>>>>req.body",req.body);

      if(!(taskName && dueDate && assignTo && remark)) {
          return res.status(400).json({
          message: 'All fields are required'
          });
      }
      const assingtoData = await userModel.findOne({email: assignTo});
      if(!assingtoData) {
          return res.status(400).json({message: 'Assign to email not found'});
      }

        const taskNameExist = await taskModel.find({taskName, assignTo: assingtoData._id});

       if(taskNameExist.length > 0) {
          return res.status(400).json({message: 'Task name already exist'});
        }
      
      const assingBy = req.user._id;
      const task = new taskModel({
          taskName,
          dueDate,
          assignTo: assingtoData,
          remark,
          assingBy: assingBy
      });
      console.log("<><>>>>task",task);

      await task.save();
      res.status(201).json({message: 'Task created'});
  }
  catch (err) {
      res.status(500).json({message: 'Internal server error'});
  }
}

exports.myTask = async (req, res) => {
  try {
      console.log(`<<<<<<<<<<<<<<`, req.user.email);

      
      if (!req.user || !req.user._id) {
          return res.status(401).json({ message: 'Unauthorized access' });
      }

     
      const task = await taskModel.find({ assignTo: req.user._id }).populate('assingBy');

    
      if (!task || task.length === 0) {
          return res.status(404).json({ message: 'No tasks found for the user' });
      }

      res.status(200).json(task);
  } catch (err) {
      console.error('Error fetching tasks:', err.message);
      res.status(500).json({ message: 'Internal server error' });
  }
}

exports.myAssignedTask = async (req, res) => {
  try {
      
      if (!req.user || !req.user._id) {
          return res.status(401).json({ message: 'Unauthorized access' });
      }

      const task = await taskModel.find({ assingBy: req.user._id }).populate('assignTo');

    
      if (!task || task.length === 0) {
          return res.status(404).json({ message: 'No tasks found assigned by the user' });
      }

      res.status(200).json(task);
  } catch (err) {
      console.error('Error fetching assigned tasks:', err.message);
      res.status(500).json({ message: 'Internal server error' });
  }
}

exports.completeTask = async (req, res) => {
  try {
      const { _id } = req.params;

      if (!_id) {
          return res.status(400).json({ message: 'Task ID is required' });
      }

      const task = await taskModel.findById(_id);

      if (!task) {
          return res.status(404).json({ message: 'Task not found' });
      }

      if (task.status === 'Completed') {
          return res.status(400).json({ message: 'Task is already completed' });
      }

      task.status = 'Completed';
      await task.save();

      res.status(200).json({ message: 'Task completed successfully' });
  } catch (err) {
      console.error('Error completing task:', err.message);
      res.status(500).json({ message: 'Internal server error' });
  }
}

exports.deleteTask = async (req, res) => {
  try {
      const { _id } = req.params;

     
      if (!_id) {
          return res.status(400).json({ message: 'Task ID is required' });
      }

  
      const task = await taskModel.findById(_id);
      if (!task) {
          return res.status(404).json({ message: 'Task not found' });
      }

      if (task.assingBy.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'You are not authorized to delete this task' });
      }

    
      await taskModel.findByIdAndDelete(_id);

      res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
      console.error('Error deleting task:', err.message);
      res.status(500).json({ message: 'Internal server error' });
  }
}

exports.updateTask = async (req, res) => {
  try {
      console.log("req.body",req.body);
      const { _id } = req.params;
      const { taskName, dueDate, remark } = req.body;
      if(!(_id && taskName && dueDate && remark)) {
          return res.status(400).json({message: 'All fields are required'});
      }
      const task = await taskModel.findOne({_id});
      console.log("task ",task);
      if(!task) {
          return res.status(400).json({message: 'Task not found'});
      }
      const updatedTask = {
          taskName,
          dueDate,
          remark
      }
      await taskModel.findByIdAndUpdate({_id}, updatedTask);
     
      res.status(200).json({message: 'Task updated'});
  }
  catch (err) {
      res.status(500).json({message: 'Internal server error'});
  }
}
const getCsvExportUrl = async (sheetLink) => {
    const regex = /\/d\/([^/]+)\/.*(?:gid=([0-9]+))?/;
    const match = sheetLink.match(regex);
          
    if (!match) {
        throw new Error("Invalid Google Sheets URL");
    }
    const spreadsheetId = match[1];
    const gid = match[2] || '0'; 
          
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
}

exports.uploadSheet = async (req, res) => {
    console.log(req.body);
   try {
    const {sheetUrl} = req.body;
    if(!sheetUrl) {
        return res.status(400).json({message: 'Sheet url is required'});
    }


 
    const csvUrl = await getCsvExportUrl(sheetUrl);
    console.log("csvUrl",csvUrl);

    const fetchAndSaveTasks = async () => {
                 try {
                      const response = await axios.get(csvUrl);
                      const tasks = await csv().fromString(response.data);
                  
                      // Optional: parse date if you have dueDate column
                      const formattedTasks = tasks.map(task => {
                        // Split the dueDate string (assumes format MM/DD/YYYY)
                        const [month, day, year] = task.dueDate.split('/');
                        const validDate = new Date(year, month - 1, day); // JavaScript me month 0-indexed hota hai
                        return { ...task, dueDate: validDate };
                      });
                      
                      console.log(('task>>',formattedTasks))

                      for (const task of formattedTasks) {

            const assingtoData = await userModel.findOne({email: task.assignTo});
                        console.log("assingtoData",assingtoData);
                        if(!assingtoData) {
                            return res.status(400).json({message: 'Assign to email not found'});
                        }
                        
                        const duplicate = await taskModel.findOne({
                          taskName: task.taskName,
                          assignTo: assingtoData._id
                        });
                  
                        if (duplicate) {
                          console.log(`Task "${task.taskName}" already assigned to ${task.assignTo}. Skipping insertion.`);
                          continue; // Skip to next task
                        }
                  
                        // If not duplicate, then save the task
                        try {
                          const newTask = new taskModel({
                            taskName: task.taskName,
                            dueDate: task.dueDate,
                            assignTo: assingtoData._id,
                            remark: task.remark,
                            assingBy: req.user._id // Assuming the user creating the task is in req.user
                          });
                          await newTask.save();
                          console.log(`Task "${task.taskName}" for ${task.assignTo} saved successfully!`);
                        } catch (error) {
                          console.error(`Error saving task "${task.taskName}":`, error);
                        }
                      }
                  
                  
                      console.log('✅ Tasks saved to MongoDB!');

                    } catch (error) {
                      console.error('❌ Error importing tasks:', error.message);
                    }
                  }
            
    await fetchAndSaveTasks();

   } catch (error) {
    return res.status(500).json({message: 'Internal server error'});
   }

}
