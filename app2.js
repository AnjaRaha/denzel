const {makeExecutableSchema} = require('graphql-tools');
const retry = require('async-retry');
const graphqlHTTP = require('express-graphql');
const {GraphQLSchema} = require('graphql');
const imdb = require('./src/imdb');
const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const {ASYNC_MAX_RETRY} = require('./constantsGraph');

const uri =  "mongodb+srv://Denzel:denzel@denzelw-0biil.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "DenzelMovies";
const DENZEL_IMDB_ID = 'nm0000243';
const port = 9292;


var app = Express();
var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));




  

  const typeDefs = [`
  type Query {
   populate: Int
   movie:Movie
   searchMovieById(id : String!): Movie
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
    movie: Movie
  }
`];



const resolvers = {
  'Query': {
    
    'populate': async (obj, args, context) => {
      
      const {collection} = context;
      return await retry(async () => {
        imdb(DENZEL_IMDB_ID).then((val)=>{
          movies = val;
          collection.insertMany(movies,(error,result)=>{
            if(error){
              return res.status(500).send(error);
            }
            console.log('populating successful of '+ result.result.n + "  movies");
            return result.result.n;
          });
        });  
        
      },{'retries': ASYNC_MAX_RETRY});
    },
    
      'movie' : async (obj, args, context) => {
      
        const {collection} = context;
        return await retry(async () => {
          const cursor = await  collection.aggregate([{$match : {metascore:{$gte : 77}}},{$project : {title : 1 , _id:0}},
            {$sample:{size : 1}}]);
          const res = await cursor.toArray();
          console.log(res[0]);
          return res[0];
        }, {'retries': ASYNC_MAX_RETRY});

      },
      'searchMovieById': async (obj, args, context) => {
      
        const {collection} = context;
        const {id} = args;
        console.log(id);
        return await retry(async () => {
          const cursor = await collection.aggregate([{$match :{ id : id }},{$sample : {size : 1}}]);
          const res = await cursor.toArray();
          console.log(res[0]);
          return res[0];
          
        }, {'retries': ASYNC_MAX_RETRY});
      }
}
};


module.exports = makeExecutableSchema({ 
  typeDefs,
  resolvers
});
