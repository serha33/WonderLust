const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema}= require("./schema.js");


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,'public')));

const validateListings =(req,res,next) =>{
   let {error} = listingSchema.validate(req.body);
     if (error){
      let errMsg = error.details.map((el)=> el.message).join(",");
       throw new ExpressError(400, errMsg);
     } else {
      next();
     }
}

const mongoURI = "mongodb://127.0.0.1:27017/WonderLust";

main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

async function main() {
    await mongoose.connect(mongoURI);
}

app.get('/', (req, res) => {
  res.send('Hello, World!');
});
//Index Route
app.get('/listings',
  validateListings,
  wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
}));

// New Route
app.get('/listings/new', (req, res) => {
  res.render('listings/new.ejs');
});

// Edit Route
app.get('/listings/:id/edit',
  validateListings,
  wrapAsync(async (req, res) => {
   let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render('listings/edit.ejs', { listing });
}));

//Update route
app.put("/listings/:id",
  validateListings,
  wrapAsync(async (req, res) => {
let { id } = req.params;
await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
res.redirect(`/listings/${id}`);
}));

//Delete route
app.delete("/listings/:id",
 validateListings,
 wrapAsync(async (req, res) => {
let { id } = req.params;
let deletedlistring = await Listing.findByIdAndDelete(id);
res.redirect("/listings");
}));

// Show Route
app.get('/listings/:id',
  validateListings,
  wrapAsync (async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render('listings/show.ejs', { listing });
}));

//Create Route
app.post('/listings',
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

app.all("/{*splat}",(req,res,next)=>{
  next(new ExpressError(404, "Page not found"))
}

)

 app.use((err,req,res,next)=> {
  let {statusCode=500, message="Something went wrong"} =err;
  res.status(statusCode).render("error.ejs",{message});
  // res.status(statusCode).send(message);
 });

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
