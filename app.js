const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,'public')));


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



app.use("/listings",listings);
app.use("/listings/:id/reviews", reviews);

app.all("/{*splat}",(req,res,next)=>{
  next(new ExpressError(404, "Page not found"))
});

 app.use((err,req,res,next)=> {
  let {statusCode=500, message="Something went wrong"} =err;
  res.status(statusCode).render("error.ejs",{message});
  // res.status(statusCode).send(message);
 });

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
