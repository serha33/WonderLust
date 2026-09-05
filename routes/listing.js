const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema}= require("../schema.js");
const Listing = require('../models/listing');
const { isLoggedIn } = require('../middleware.js');

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
  wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
}));

// New Route
router.get('/new', isLoggedIn, (req, res) => {
  res.render('listings/new.ejs');
});

// Edit Route
router.get('/:id/edit', isLoggedIn,
  wrapAsync(async (req, res) => {
   let { id } = req.params;
  const listing = await Listing.findById(id);
   if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }
  res.render('listings/edit.ejs', { listing });
}));

//Update route
router.put("/:id",
  isLoggedIn,
  validateListings,
  wrapAsync(async (req, res) => {
let { id } = req.params;
await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
req.flash("success", "Listing Updated");
res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/:id",
 isLoggedIn,
 wrapAsync(async (req, res) => {
 let { id } = req.params;
 let deletedlistring = await Listing.findByIdAndDelete(id);
 req.flash("success", "Listing Deleted");
 res.redirect('/listings');
}));

// Show Route
router.get('/:id',
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }
    res.render('listings/show.ejs', { listing });
  }));

//Create Route
router.post('/',
  validateListings, 
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing created");
    res.redirect('/listings');
}));

module.exports = router;