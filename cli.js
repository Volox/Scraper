#! /usr/bin/env node
require( './build/scraper' )( process.argv )
.catch( err => {
  process.error( err );
} );
//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78