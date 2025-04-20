const userModel = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret_key = '55354trw4fvrg65grtv56'

const axios = require('axios')
const csv = require('csvtojson')

exports.signup = async (req, res) => {
    try {
        console.log("req.body>>>>",req.body)
        
        const { email, password,name,address,phone } = req.body;
        if(!(email && password && name && address  && phone )) {
            return res.status(400).json({message: 'All fields are required'});
        }
        const user = await userModel.findOne({email}); // check if user already exists
        if (user) {
            return res.status(400).json({message: 'User already exists'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = new userModel({
            email,
            password: hashPassword,
            name,
            address,
            phone,
        }); 
        await newUser.save();
        res.status(201).json({message: 'User created'});
    }
    catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({email}); 
        if (!user) {
            return res.status(400).json({message: 'User not found'});
        }
        const name = user.name;
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                message: 'Invalid password'
            });
        }
        const token = jwt.sign({_id: user._id},secret_key,{expiresIn: '1d'});

        res.status(200).json({message:"Login Succesful",token,name});
    }
    catch (err) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

exports.getuser = async (req, res) => {
    try {
        const user = await userModel.find();
        if (!user || user.length === 0) {
            return res.status(404).json({message: 'No users found'});
        }
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
}

