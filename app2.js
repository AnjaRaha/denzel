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

var database, collection;


  

  const typeDefs = [`
  type Query {
   populate: Int
  }
  type Movie {
    link: String
    metascore: Int
    synopsis: String
    title: String
    year: Int
  }
  schema {
    query: Query
  }
`];



const resolvers = {
  'Query': {
    'populate': () =>{
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
    },

      )}
}
}



/*const movies = { movie : ()=>{
    collection.aggregate([{$match : {metascore:{$gte : 77}}},{$project : {title : 1 , _id:0}},
        {$sample:{size : 1}}]).toArray((error,result)=>{
            if(error){
                return res.status(500).send(error);
            }
            res.send(JSON.stringify(result, null,2));
        })
        
        }
}*/

module.exports = makeExecutableSchema({ 
  typeDefs,
  resolvers
});
