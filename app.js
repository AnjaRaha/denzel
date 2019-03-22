const Express = require ("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID =  'nm0000243';

const CONNECTION_URL = "mongodb+srv://Denzel:denzel@denzelw-0biil.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "DenzelMovies";

var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));

var database, collection, movies;


  MongoClient.connect(CONNECTION_URL,{useNewUrlParser:true},(error,client)=>{
    if(error){
      throw error;
    }
    database = client.db(DATABASE_NAME);
    collection = database.collection("movies");
    console.log("connect to `"+ DATABASE_NAME + " `!");
  });

//populate the database denzel
app.get('/movies/populate',(req,res)=>{
  if(!collection){
    return res.status(500).send('The database s not connected');
  }
  imdb(DENZEL_IMDB_ID).then((val)=>{
    movies = val;
    collection.insertMany(movies,(error,result)=>{
      if(error){
        return res.status(500).send(error);
      }
      console.log('populating successful of '+ result.result.n + "  movies");
      retour = {"total" : result.result.n};
      res.send(retour);
    });
  });
});


//fetch a random must-watch movie
app.get('/movies',(req,res)=>{
    if(!collection) {
        return res.status(500).send('The database is not connected'); 
    }
    collection.aggregate([{$match : {metascore:{$gte : 77}}},{$project : {title : 1 , _id:0}},
      {$sample:{size : 1}}]).toArray((error,result)=>{
        if(error){
            return res.status(500).send(error);
        }
      res.send(JSON.stringify(result, null,2));
    });
});

//search for denzel's movies 

app.get("/movies/search", (req, res) => {
  var metascore = req.query.metascore;
  var limit = req.query.limit ;
  if(metascore==undefined)
  {
      metascore = 0;
  }
  if(limit==undefined)
  {
      limit =5;
  }
  collection.aggregate([{$match: { metascore: { $gte: Number(metascore) } }},{$project : {title : 1 , _id:0}},{ $sample: { size:  Number(limit) }},
    {$sort:{"metascore":-1}} ]).toArray((error, result) => 
  {
      if (error) {
        return res.status(500).send(error);
      }
      res.send(JSON.stringify(result, null,2))
    });
});

// fetch a specific movie
app.get('/movies/:id', (req, res) => {
    if (!collection) {
        return res.status(500).send('Database not connected');
    }
    var id = req.params.id;
   
    collection.aggregate([{$match :{id : id}},{$sample :{size : 1}}]).toArray((error, result) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.send(JSON.stringify(result, null,2))
    });
});

app.post("/movies/:id", (request, response) => {
  console.log(request.body);
  collection.updateOne({"id":request.params.id},{$set :{"date":request.body.date,"review":request.body.review}}, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result.result);
  });
});





app.listen(9292)