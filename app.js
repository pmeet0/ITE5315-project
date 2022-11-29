var express = require('express');
var mongoose = require('mongoose');
var app = express();
var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
require('dotenv').config()

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

var url = mongoose.connect(database.url);
var restaurant = require('./models/restaurants');
const exphbs = require('express-handlebars');
const fs = require('fs');
var path = require("path");
app.use(express.static(path.join(__dirname, "public")));

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
    mongoose.connect(database.url, function (err) {
        if (err == null) 
        console.log(conn);

        else {
            console.error(err);
            process.exit();
        }
    });
}


app.post('/api/restaurants', function (req, res) {
    if (!req.body) return res.status(400).render('error', { title: "400", message: "Bad Request" })

    console.log(req.body);
    
    let address_data = {
        building: req.body.building,
        coord: [req.body.lat, req.body.lon],
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
        if (err)

            throw err;

        res.send('Successfully! restaurant added - ' + restaurant.name);
    });
});

app.get('/api/restaurants', function (req, res) {

    let page = req.query.page;
    let perPage = req.query.perPage;
    let boroug = req.query.borough;

    if (boroug) {
        restaurant.find({ borough: boroug }, null, { limit: perPage, skip: (page - 1) * perPage }, function (err, restaurant) {
            if (err) {
                console.log(err);
                res.status(400).render('error', { title: "400", message: err })
            }
            else {
                res.send(restaurant)
            }
        })
    }
    else {
        restaurant.find(null, null, { limit: perPage, skip: (page - 1) * perPage }, function (err, docs) {
            if (err) {
                console.log(err);
                res.status(400).render('error', { title: "400", message: err })
            }
            else {
                res.send(docs)
            }
        })
    }
}
);


app.get('/api/restaurants/:restaurant_id', function (req, res) {
    let id = req.params.restaurant_id;
    restaurant.findById(id, function (err, restaurant) {
        if (err)
            res.status(400).render('error', { title: "400", message: err })

        res.json(restaurant);
    });
});


app.delete('/api/restaurants/:restaurant_id', function (req, res) {
    console.log(req.params.restaurant_id);
    let id = req.params.restaurant_id;
    restaurant.remove({
        _id: id
    }, function (err) {
        if (err)
            res.status(400).render('error', { title: "400", message: err });
        else
            res.send('Successfully! restaurant has been Deleted.');
    });
});

app.put('/api/restaurants/:restaurant_id', function (req, res) {
    if (!req.body) return res.status(400).render('error', { title: "400", message: "Bad Request" })
    // create mongose method to update an existing record into collection
    console.log(req.body);
    let address_data = {
        building: req.body.building,
        coord: [req.body.lat, req.body.lon],
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
        if (err)
            throw err;

        res.send('Successfully! restaurant updated - ' + restaurant.name);
    });
});

app.get('/api/restaurants_data', async function (req, res) {
    // use mongoose to get all restaurant in the database
    restaurant.find(function (err, restaurant) {
        // if there is an error retrieving, send the error otherwise send data
        if (err)
            res.status(400).render('error', { title: "400", message: err })
        var restaurant_data = JSON.stringify(restaurant);
        res.render('data', { data: JSON.parse(restaurant_data) });
    });
});

//route for wrong path
app.get('*', function (req, res) {                   
    //Rendering error handebar and pass value for handlebars       
    res.render('error', { title: 'Error', message: 'Wrong Route' });        
});

initialize("Connected successfully");
app.listen(port);
console.log(`App is listening on port ${port}`);
