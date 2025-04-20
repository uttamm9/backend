const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const router = require('./routers/userRoute');

const port = process.env.PORT || 3000;
const mongo_url = process.env.mongo_url || 'mongodb://localhost:27017/mydatabase';

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

mongoose.connect(mongo_url)
.then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB', err);
});

app.use('/tasks',router);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})