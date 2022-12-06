var express = require('express');
var mongoose = require('mongoose');
var app = express();
//var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
require('dotenv').config()

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

//var url = mongoose.connect(database.url);
var restaurant = require('./models/restaurants');
const exphbs = require('express-handlebars');
const fs = require('fs');
var path = require("path");
app.use(express.static(path.join(__dirname, "public")));

const jwt = require('jsonwebtoken')

const HBS = exphbs.create({
    extname: ".hbs",
    // custom helpers
    helpers: {
    },
});

app.engine(".hbs", HBS.engine);
app.set('view engine', '.hbs')


//Initializing Module
function initialize(conn) {
    mongoose.connect(process.env.mongo_string, function (err) {
        if (err == null)
            console.log(conn);
        else {
            console.error(err);
            process.exit();
        }
    });
}

var token = null;

function verifyToken(req, res, next) {

    if (typeof token != 'undefined') {

        jwt.verify(token,
            process.env.SECRETKEY, (err, user) => {
                if (err) {
                    console.log(403)
                    res.sendStatus(403)

                }
                else {
                    req.user = user;
                    console.log(req.user)
                    next()

                }
            });


    }
    else {
        res.render('error', { message: "Token is required!" });
    }
}

var bcrypt = require('bcryptjs');
let hash = process.env.PASS;

app.get("/login", (req, res) => {

    res.render('login');
});

// Login For authorize user only
app.post("/login", (req, res) => {

    const password = req.body.password;

    bcrypt.compare(password, hash).then((result) => {

        if (result === true) {

            const token1 = jwt.sign(
                { user_id: 1 },
                process.env.SECRETKEY,
                {
                    expiresIn: "2m",
                }
            );
            //saving the token
            token = token1;
            console.log(token);
            // If login is Success
            res.send("Success: Now you have full access of website");
        }

        else {
            res.status(404).render('error', { message: "Invalid Credentials" });
        }
    })
});

app.get('/posts', verifyToken, (req, res) => {

    res.json('Verified')

})

app.post('/api/restaurants', verifyToken, (req, res) => {

    if (!req.body) return res.status(400).render('error', { title: "400", message: "Bad Request" })

    console.log(req.body);

    let address_data = {
        building: req.body.building,
        coord: { 0: req.body.lat, 1: req.body.lon },
        street: req.body.street,
        zipcode: req.body.zipcode
    }
    let borough_data = req.body.borough
    let cuisine_data = req.body.cuisine
    let grades_data = [{
        date: req.body.date,
        grade: req.body.grade,
        score: req.body.score
    }]
    let name_data = req.body.name
    let restaurant_id_data = req.body.restaurant_id

    var data = {
        _id: req.body._id,
        address: address_data,
        borough: borough_data,
        cuisine: cuisine_data,
        grades: grades_data,
        name: name_data,
        restaurant_id: restaurant_id_data
    }

    // db.addNewRestaurant
    restaurant.create(data, function (err, restaurant) {
        if (err) {
            res.render('error', { message: "Error in creating data" })
            throw err;
        }

        else {
            res.send('Successfully! restaurant added ' + restaurant.name);
        }
    });
});


app.get('/filter/restaurants', (req, res) => {

    res.render('filter')

})


app.get('/api/restaurants', (req, res) => {

    let page = req.query.page;
    let perPage = req.query.perPage;
    let boroug = req.query.borough;

    if (boroug) {
        restaurant.find({ borough: boroug }, null, { limit: perPage, skip: (page - 1) * perPage }, function (err, restaurant) {
            if (err) {
                console.log(err);
                res.status(400).render('error', { title: "404", message: err })
            }
            else {
                var restaurant_data = JSON.stringify(restaurant);
                res.render('data', { data: JSON.parse(restaurant_data) });
            }
        })
    }
    else {
        restaurant.find(null, null, { limit: perPage, skip: (page - 1) * perPage }, function (err, restaurant) {
            if (err) {
                console.log(err);
                res.status(400).render('error', { title: "400", message: err })
            }
            else {
                var restaurant_data = JSON.stringify(restaurant);
                res.render('data', { data: JSON.parse(restaurant_data) });
            }
        })
    }
});


app.get('/api/restaurants/:restaurant_id', function (req, res) {
    let id = req.params.restaurant_id;
    restaurant.findById(id, function (err, restaurant) {
        if (err) {
            console.log(err);
            res.status(400).render('error', { title: "400", message: err })
        }
        else {
            res.json(restaurant);
        }
    });
});


app.delete('/api/restaurants/:restaurant_id', verifyToken, (req, res) => {
    console.log(req.params.restaurant_id);
    let id = req.params.restaurant_id;
    restaurant.remove({
        restaurant_id: id
    }, function (err) {
        if (err)
            res.status(400).render('error', { title: "400", message: err });
        else
            res.send('Successfully! restaurant has been Deleted.');
    });
});

app.put('/api/restaurants/:restaurant_id', verifyToken, (req, res) => {
    if (!req.body) return res.status(400).render('error', { title: "400", message: "Bad Request" })
    // create mongose method to update an existing record into collection
    console.log(req.body);

    let address_data = {
        building: req.body.building,
        coord: { 0: req.body.lat, 1: req.body.lon },
        street: req.body.street,
        zipcode: req.body.zipcode
    }
    let borough_data = req.body.borough
    let cuisine_data = req.body.cuisine
    let grades_data = [{
        date: req.body.date,
        grade: req.body.grade,
        score: req.body.score
    }]
    let name_data = req.body.name
    let restaurant_id_data = req.body.restaurant_id

    var data = {
        _id: req.body._id,
        address: address_data,
        borough: borough_data,
        cuisine: cuisine_data,
        grades: grades_data,
        name: name_data,
        restaurant_id: restaurant_id_data
    }

    restaurant.findByIdAndUpdate(id, data, function (err, restaurant) {
        if (err) {
            res.render('error', { message: "Error in updating data" })
            throw err;
        }

        else {
            res.send('Successfully! restaurant updated ' + restaurant.name);
        }
    });
});

app.get('/api/plaindata/restaurants', verifyToken, function (req, res) {
    // use mongoose to get all restaurant in the database
    restaurant.find(function (err, restaurant) {
        // if there is an error retrieving, send the error otherwise send data
        if (err)
            res.status(400).render('error', { title: "400", message: err })
        res.json(restaurant);

    });
});

app.get('/', function (req, res) {

    res.render('home', { message: "Welcome to restaurant api" });
});

app.get('/logout', function (req, res) {
    token = null;
    res.send("Logout Successfully")
});

//route for wrong path
app.get('*', function (req, res) {
    //Rendering error handebar and pass value for handlebars       
    res.render('error', { title: 'Error', message: '404 Wrong Route' });
});

initialize("Connected successfully");
app.listen(port);
console.log(`App is listening on port ${port}`);
