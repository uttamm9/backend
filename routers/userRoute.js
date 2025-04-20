const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const taskController = require('../controller/taskController');
const auth = require('../middleware/useAuth')

router.post('/signup',userController.signup);

router.post('/login',userController.login);

router.get('/getUser',auth,userController.getuser);

router.post('/createTask',auth,taskController.createTask);

router.get('/getTask',auth,taskController.myTask);

router.get('/myAssingTask',auth,taskController.myAssignedTask);

router.patch('/completeTask/:_id',auth,taskController.completeTask);

router.delete('/deleteTask/:_id',auth,taskController.deleteTask);

router.patch('/updateTask/:_id',auth,taskController.updateTask);

router.post('/uploadFromSheet',auth,taskController.uploadSheet);

module.exports = router