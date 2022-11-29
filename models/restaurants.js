// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


RestaurantsSchema = new Schema({
    _id: String,
  address: {
    building: String,
    coord: Array,
    street: String,
    zipcode: String,
  },
  borough: String,
  cuisine: String,
  grades: Array,
  name: String,
  restaurant_id: String
});
module.exports = mongoose.model('restaurants', RestaurantsSchema);
