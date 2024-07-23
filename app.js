const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

mongoose.connect('mongodb://localhost:27017/employeeAttendance', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const employeeSchema = new mongoose.Schema({
    empId: String,
    date: String,
    arrivalTime: String,
    leaveTime: String
});

const Employee = mongoose.model('Employee', employeeSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { message: null });
});

app.post('/arrival', async (req, res) => {
    const { empId } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const arrivalTime = new Date().toLocaleTimeString();

    let employee = await Employee.findOne({ empId, date });
    if (employee) {
        return res.render('index', { message: 'You have already set your arrival time for today.' });
    } else {
        employee = new Employee({ empId, date, arrivalTime });
        await employee.save();
        return res.render('index', { message: 'Arrival time set successfully.' });
    }
});

app.post('/leave', async (req, res) => {
    const { empId } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const leaveTime = new Date().toLocaleTimeString();

    const employee = await Employee.findOne({ empId, date });
    if (!employee) {
        return res.render('index', { message: 'You cannot set leave time without setting arrival time first.' });
    } else if (employee.leaveTime) {
        return res.render('index', { message: 'You have already set your leave time for today.' });
    } else {
        employee.leaveTime = leaveTime;
        await employee.save();
        return res.render('index', { message: 'Leave time set successfully.' });
    }
});

app.get('/manager', async (req, res) => {
    const employees = await Employee.find({});
    res.render('manager', { employees });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});