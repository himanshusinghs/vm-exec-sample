const fs = require('fs/promises');
const path = require('path');
const vm = require('node:vm');
const app = require('express')();
const { MongoClient } = require("mongodb");

// Insert your mongo connection uri here
const uri = "your-mongodb-uri";

// Here we construct a mongoclient object
const client = new MongoClient(uri);

function readScriptFile(scriptname) {
  const scriptfilePath = path.join(__dirname, 'queries', `${scriptname}.js`);
  return fs.readFile(scriptfilePath, 'utf8');
}

// During the entire run of this api server we connect to mongodb server only
// once before the server starts then we simply use that connection for every
// request to retrieve the database object and provide it to scripts that are
// run in secure sandbox
app.get('/execute-query', async function (req, res) {
  try {
    // Here we get the script name to execute from request query
    const scriptname = req.query.scriptname;

    // Here we read the javascript from script file
    const jsString = await readScriptFile(scriptname);

    // Here we create a secure sandbox for our script to execute in Using this way
    // we make sure that one script execution does not trouble other scripts
    // execution in any way possible
    // -----
    // Additionally we attach three variables to the global scope of the secure
    // sandbox.
    //  1. The instance of database which the scripts will use to perform database operations
    //  2. The function passResult which is used by the script to send a result (JS variable) back to the main controller
    //  3. The function passCursor which is used by the script to send a cursor back to the main controller
    // more about nodejs vm here - https://nodejs.org/api/vm.html
    const context = vm.createContext({
      db: client.db('script-db'),
      passResult(result) {
        // When we have received the result, we terminate the response right away
        res.json({ result: result });
      },
      async passCursor(cursor) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');
        // Start of an array
        res.write('[');
        // Since we received a cursor we have to iterate on it to produce the result
        for await (const doc of cursor) {
          // Transform the document to JSON string and write it to response
          res.write(JSON.stringify(doc));
          // Also write the separator
          res.write(',');
        }
        // Terminate the array
        res.write(']');
        // End the response stream
        res.end();
      }
    });
    
    // Here we are converting our jsString to be executed into a Script object
    // that can be executed in the secure sandbox
    const script = new vm.Script(jsString);

    // Here we run our script in the secure sandbox that we created earlier
    await script.runInContext(context);
  } catch (error) {
    // In case of errors we send an error response
    res.status(500).end(error.message);
  }
});

// Here we connect to our mongodb deployment. Notice that the connection happens
// only once Read more about mongodb drivers here -
// https://www.mongodb.com/docs/drivers/node/current/quick-start/
client.connect()
  .then(() => app.listen(3000, () => console.log('Listening')));