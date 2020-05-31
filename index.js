/* eslint-disable no-unused-vars */
/* eslint-disable padded-blocks */
const reservedWords = [ "menu", "tableware", "check" ];
const timers = {};

const WebSocket = require( "ws" );
const {
  Client
} = require( "pg" );

const connectionString = "postgresql://postgres:55gapagi@localhost:5432/WaiterHelper";
const dbclient = new Client( {
  connectionString: connectionString
} );
dbclient.connect();

const WebSocketServer = new WebSocket.Server( {
  port: 8080
} );

console.log( "Server started" );

WebSocketServer.on( "connection", function connection( ws ) {
  ws.on( "message", async function incoming( message ) {
    console.log( "received: ", message );

    message = await new Promise( ( resolve, reject ) => {
      const processedMessage = messageProcessing( message );
      resolve( processedMessage );
    } );

    WebSocketServer.clients.forEach( function each( client ) {
      if ( client.readyState === WebSocket.OPEN ) {
        client.send( message );
      };
    } );
  } );
} );

async function messageProcessing( message ) {

  // parse received message
  const messageParced = JSON.parse( message );

  // check message type
  if ( messageParced.type === "event" ) {
    const tableCode = messageParced.table_code;
    const cardCode = messageParced.card_code;
    const eventTime = new Date();

    // get table name from database
    const tableResult = await new Promise( ( resolve, reject ) => {
      dbclient.query( "SELECT id, table_name FROM tables WHERE table_code = $1", [ tableCode ],
        ( err, res ) => {
          if ( err ) {
            console.log( err.stack );
          } else {
            console.log( "tableResult: " + JSON.stringify( res.rows[ 0 ] ) );
            resolve( res.rows[ 0 ] );
          }
        } );
    } );

    // get card name from database
    const cardResult = await new Promise( ( resolve, reject ) => {
      dbclient.query( "SELECT id, card_name FROM cards WHERE card_code = $1", [ cardCode ],
        ( err, res ) => {
          if ( err ) {
            console.log( err.stack );
          } else {
            console.log( "cardResult: " + JSON.stringify( res.rows[ 0 ] ) );
            resolve( res.rows[ 0 ] );
          }
        } );
    } );

    // check if there isn't table or card name in database
    if ( !tableResult || !cardResult ) {

      // change output message type
      messageParced.type = "insert";

      // if there is the only one new code - delete the other
      if ( !tableResult && cardResult ) {
        delete messageParced.card_code;
      }
      if ( !cardResult && tableResult ) {
        delete messageParced.table_code;
      }

      // check if it's waiter's card
    } else if ( !reservedWords.includes( cardResult.card_name ) ) {

      console.log( "waiter's card" );

      // change output message type
      messageParced.type = "stop";

      // db update
      await new Promise( ( resolve, reject ) => {
        dbclient.query( "UPDATE events SET processed = true WHERE table_id = $1",
          [ tableResult.id ], ( err, res ) => {
            if ( err ) {
              console.log( err.stack );
            } else {
              console.log( "Update successed" );
              resolve();
            }
          } );
      } );

      // calculate service time
      const serviceTime = await new Promise( ( resolve, reject ) => {
        resolve( Math.floor( ( eventTime - timers[ tableResult.table_name ] ) / 1000 ) );
      } );

      // new record in service table
      await new Promise( ( resolve, reject ) => {
        dbclient.query( "INSERT INTO service(card_id, time) VALUES($1, $2)",
          [ cardResult.id, serviceTime ], ( err, res ) => {
            if ( err ) {
              console.log( err.stack );
            } else {
              console.log( "Insert successed" );
              resolve();
            }
          } );
      } );

      // delete card code in output message
      delete messageParced.card_code;

      // in output message replace table code with it name
      messageParced.table_code = tableResult.table_name;

      // delete record from "timers"
      delete timers[ tableResult.table_name ];

    } else {

      // add new record to "timers"
      timers[ tableResult.table_name ] = new Date();

      // if both names are provided in database - create new record in "events"
      await new Promise( ( resolve, reject ) => {
        dbclient.query( "INSERT INTO events(card_id, table_id, time) VALUES($1, $2, $3)",
          [ cardResult.id, tableResult.id, eventTime ], ( err, res ) => {
            if ( err ) {
              console.log( err.stack );
            } else {
              console.log( "Insert successed" );
              resolve();
            }
          } );
      } );

      // in output message replace table and card codes with their names
      messageParced.table_code = tableResult.table_name;
      messageParced.card_code = cardResult.card_name;
    }

    // if message type "insert"
  } else if ( messageParced.type === "insert" ) {

    // if message contains table code
    if ( messageParced.table_code ) {
      await new Promise( ( resolve, reject ) => {
        dbclient.query( "INSERT INTO tables(table_code, table_name) VALUES($1, $2)",
          [ messageParced.table_code, messageParced.table_name ], ( err, res ) => {
            if ( err ) {
              console.log( err.stack );
            } else {
              console.log( "Insert successed" );
              resolve();
            }
          } );
      } );
    }

    // if message contains card code
    if ( messageParced.card_code ) {
      await new Promise( ( resolve, reject ) => {
        dbclient.query( "INSERT INTO cards(card_code, card_name) VALUES($1, $2)",
          [ messageParced.card_code, messageParced.card_name ], ( err, res ) => {
            if ( err ) {
              console.log( err.stack );
            } else {
              console.log( "Insert successed" );
              resolve();
            }
          } );
      } );
    }

    // change output message type
    messageParced.type = "inserted";
  }

  // create output message
  message = JSON.stringify( messageParced );
  console.log( "output message: " + message + "\n" );
  return message;
}
