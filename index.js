const schema = require('./app2');
const {makeExecutableSchema} = require('graphql-tools');
const retry = require('async-retry');
const graphqlHTTP = require('express-graphql');
const {GraphQLSchema} = require('graphql');
const imdb = require('./src/imdb');
const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const uri =  "mongodb+srv://Denzel:denzel@denzelw-0biil.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "DenzelMovies";
const DENZEL_IMDB_ID = 'nm0000243';
const port = 9292;
var app = Express();
var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));

MongoClient.connect(uri,{useNewUrlParser:true},(error,client)=>{
    if(error){
      throw error;
    }
    database = client.db(DATABASE_NAME);
    collection = database.collection("movies");
    console.log("connect to `"+ DATABASE_NAME + " `!");
    app.use('/graphql', graphqlHTTP({
      schema : schema,
      'context': {collection},
      'graphiql': true
    }));
  });
  app.listen(9292);