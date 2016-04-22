// Load system modules
import { format } from 'url';
import { EventEmitter } from 'events';
import { Writable, Transform } from 'stream';

// Load modules
import initDebug = require( 'debug' );
import { MongoClient, Collection } from 'mongodb';
import Twit = require( 'twit' );
import wrap from '@volox/social-post-wrapper';

// Load my modules

// Constant declaration
const debug = initDebug( 'scraper:utils' );
const WINDOW = 1000*60*15;
const MAX_TWEETS = 100;

// Module variables declaration

// Module interfaces declaration
export interface TwitterCredentials {
  key: string;
  secret: string;
  token?: string;
  tokenSecret?: string;
}
export interface MongoConfig {
  host: string;
  port: number;
  database: string;
  collection: string;
}

// Module functions declaration
export async function connect( config: MongoConfig ) {
  const url = format( {
    protocol: 'mongodb',
    slashes: true,
    hostname: config.host,
    port: String( config.port ),
    pathname: config.database,
  } );
  debug( 'Connectiong to mongo @: %s', url );

  return await MongoClient.connect( url );
}

// Module class declaration
export class Enrich extends Transform {
  private credentials: TwitterCredentials;
  private api: Twit;
  private queue = [];

  constructor( credentials: TwitterCredentials ) {
    super( { objectMode: true } );

    this.credentials = credentials;
    this.api = new Twit( {
      consumer_key: credentials.key,
      consumer_secret: credentials.secret,
      access_token: credentials.token,
      access_token_secret: credentials.tokenSecret,
    } );
  }

  _transform( data, enc, cb ) {
    this.queue.push( data );

    if( this.queue.length >= MAX_TWEETS ) {
      this.processQueue( MAX_TWEETS, cb );
    } else {
      return cb();
    }
  }
  _flush( cb ) {
    this.processQueue( this.queue.length, cb );
  }

  processQueue( numTweets: number, cb ) {
    const tweets = this.queue.splice( 0, numTweets );

    return this.getFullTweets( tweets, cb );
  }
  getFullTweets( rawTweets: any[], cb ) {
    const ids = rawTweets.map( t => t.id );

    return this.api
    .post( 'statuses/lookup', {
      id: ids.join( ',' ),
      include_entities: true,
    } )
    .then( resp => {
      const tweets = <any>resp.data as Twit.Twitter.Status[];

      for( const tweet of tweets ) {
        const post = wrap( tweet, 'twitter' );
        this.push( post );
      }

      return cb();
    } )
    .catch( e => cb( e ) );
  }
}
export class MongoWriter extends Writable {
  protected collection: Collection;

  constructor( collection: Collection ) {
    super( { objectMode: true } );

    this.collection = collection;
  }
  _write( data, enc, cb ) {
    debug( 'Writing tweet: %s', data.id );
    return this.collection
    .insertOne( data )
    .then( () => cb() )
    .catch( err => cb( err ) );
  }
}
export class ToConsole extends Writable {
  constructor() {
    super( { objectMode: true } );
  }

  _write( data, enc, cb ) {
    // console.log( data );
    return cb();
  }
}
// Module initialization (at first load)

// Module exports

// Entry point

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
