var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperDB"
// db name
mongoose.connect(MONGODB_URI);

// GET data from a web API and then POST it to the database
app.get("/scrape", function (req, res) {
  // GET request to a web API
  axios.get("http://www.echojs.com/").then(function (response) {
    var $ = cheerio.load(response.data);
   
    $("article h2").each(function (i, element) {
      var result = {};
      
      result.title = $(this)
        
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // POST request to your database
      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});
// CRUD Create, Read, Update, Delete
// Create (POST): add a record to the db
// Read (GET): get a record or records from the db
// Update (PUT): change a record in the db
// Delete (DELETE): delete a record

// Get all articles
app.get("/articles", function (req, res) {
  // GET request to the database
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Get one article
app.get("/articles/:id", function (req, res) {
  // GET request to the database
  db.Article.findOne({ _id: req.params.id })
    .populate('note')
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Create an article
app.post("/articles/:id", function (req, res) {
  // POST request to the database
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id }, 
        { note: dbNote._id }, 
        { new: true }
        );
    })
    .then(function (article) {
      res.json(article);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.delete('/articles/:id', function( req, res ) {
  db.Article.delete(id).then(function() {
    res.json({ message: 'deleted' })
  }).catch(function(err) {
    console.log(err);
    res.json(err);
    throw new err;
  })
})

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});