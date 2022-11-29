// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


RestaurantsSchema = new Schema({
    _id: String,
  address: {
    building: String,
    coord: [{lat: Number, lon: Number}],
    street: String,
    zipcode: String,
  },
  borough: String,
  cuisine: String,
  grades:
  [{
    date: String,
    grade: String,
    score: Number,
}],
  name: String,
  restaurant_id: String
});
module.exports = mongoose.model('restaurants', RestaurantsSchema);
