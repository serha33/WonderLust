const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema}= require("../schema.js");
const Listing = require('../models/listing');

const validateListings =(req,res,next) =>{
   let {error} = listingSchema.validate(req.body);
     if (error){
      let errMsg = error.details.map((el)=> el.message).join(",");
       throw new ExpressError(400, errMsg);
     } else {
      next();
     }
};

//Index Route
router.get('/',
  validateListings,
  wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
}));

// New Route
router.get('/new', (req, res) => {
  res.render('listings/new.ejs');
});

// Edit Route
router.get('/:id/edit',
  validateListings,
  wrapAsync(async (req, res) => {
   let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render('listings/edit.ejs', { listing });
}));

//Update route
router.put("/:id",
  validateListings,
  wrapAsync(async (req, res) => {
let { id } = req.params;
await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/:id",
 wrapAsync(async (req, res) => {
let { id } = req.params;
let deletedlistring = await Listing.findByIdAndDelete(id);
res.redirect("/listings");
}));

// Show Route
router.get('/:id',
  validateListings,
  wrapAsync (async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render('listings/show.ejs', { listing });
}));

//Create Route
router.post('/',
  validateListings, 
  wrapAsync(async (req, res, next) => {
    listingSchema.validate(req.body);
     if (result.error){
       throw new ExpressError(400, result.error);
     }
     console.log("post route reached")
     const newListing = new Listing(req.body.listing);
     await newListing.save();
     res.redirect('/listings');
}));

module.exports = router;