// Load system modules
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { Writable, Transform, PassThrough } from 'stream';

// Load modules
import initDebug = require( 'debug' );
import { Scraper } from 'twitter-scraper';
import * as program from 'commander';

// Load my modules
import {
  connect,
  MongoConfig,
  TwitterCredentials,
  MongoWriter,
  ToConsole,
  Enrich
} from './utils';

// Constant declaration
const debug = initDebug( 'scraper' );
const CWD = process.cwd();
const pkg = require( resolve( __dirname, '..', 'package.json' ) );

// Module variables declaration

// Module interfaces declaration

// Module functions declaration
async function startScraper( query: string, transform: Transform, write: Writable ) {
  const s = new Scraper( query );

  // Pipe the components
  s.pipe( transform ).pipe( write );

  // Start the scraper
  return s.start();
}
async function parseArguments( args: string[] ) {
  program
  .version( pkg.version )
  .description( pkg.description )
  // Mongo
  .option('-M, --mongo <mongo>', 'Mongo config file' )
  .option('-m, --host <host>', 'Mongo host [localhost]', 'localhost' )
  .option('-p, --port <port>', 'Mongo port [27017]', 27017 )
  .option('-d, --database <database>', 'Mongo database name' )
  .option('-c, --collection <collection>', 'Mongo collection [tweets]', 'tweets' )
  // Twitter
  .option('-T, --twitter <twitter>', 'Twitter config file' )
  .option('-k, --key <key>', 'Twitter key' )
  .option('-s, --secret <secret>', 'Twitter secret' )
  .option('-t, --token <token>', 'Twitter access token' )
  .option('-y, --token-secret <tokenSecret>', 'Twitter access token secret' )
  // Query
  .option('-Q, --query-file <queryFile>', 'Twitter query file' )
  .option('-q, --query <query>', 'Twitter query' )
  .parse( args );


  // Define a noop transformer
  let transform: Transform = new PassThrough( { objectMode: true } );

  // Define a console writer
  let write: Writable = new ToConsole();

  // Try to get the query
  let query: string = program[ 'query' ];
  if( !query && program[ 'queryFile' ] ) {
    const queryFile: string = program[ 'queryFile' ];
    debug( 'Using query file: %s', queryFile );
    const fullPath = resolve( CWD, queryFile );
    query = readFileSync( fullPath, 'utf8' );
  }
  debug( 'Query: "%s"', query );



  // Check if must use the MongoDB writer
  if( program[ 'mongo' ] || program[ 'database' ] ) {
    debug( 'Using the mongo writer' );
    let config: MongoConfig;
    if( program[ 'mongo' ] ) {
      debug( 'Using the mongo config file: %s', program[ 'mongo' ] );
      config = require( resolve( CWD, program[ 'mongo' ] ) );
    } else {
      config.host = program[ 'host' ];
      config.port = program[ 'port' ];
      config.database = program[ 'database' ];
      config.collection = program[ 'collection' ];
    }
    debug( 'Using the mongo config: ', config );

    const db = await connect( config );
    const collection = db.collection( config.collection );
    write = new MongoWriter( collection );

    write.once( 'finish', () => db.close() );
  }


  // Check if must use the twitter transformer
  if( program[ 'twitter' ] || program[ 'key' ] ) {
    debug( 'Using the twitter transformer' );
    let config: TwitterCredentials;
    if( program[ 'twitter' ] ) {
      debug( 'Using the twitter config file: %s', program[ 'twitter' ] );
      config = require( resolve( CWD, program[ 'twitter' ] ) );
    } else {
      config.key = program[ 'key' ];
      config.secret = program[ 'secret' ];
      config.token = program[ 'token' ];
      config.tokenSecret = program[ 'tokenSecret' ];
    }
    debug( 'Using the twitter config: ', config );

    transform = new Enrich( config );
  }

  const total = await startScraper( query, transform, write );
  debug( 'All done, got %d tweets', total );
}
// Module class declaration

// Module initialization (at first load)

// Module exports
export = parseArguments;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
