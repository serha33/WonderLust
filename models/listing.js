const mongoose = require('mongoose');
const schema = mongoose.Schema;
const listingSchema = new schema({
  title: {
    type: String,
    required: true
  },
  description:String,
  images: {
  type: String,
  set: (v) => v === "" ? "https://unsplash.com/photos/a-path-with-light-posts-and-trees-by-the-water-Wi3zjH4pB1k" : v,
  },
  
  price: Number,
  location: String,
  country: String,



});


module.exports = mongoose.model('Listing', listingSchema);
module.exports = Listing;