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
    // Additionally we attach two variables to the global scope of the secure
    // sandbox. One is the instance of database which the scripts will use to
    // perform database operations and the other is the result variable which is
    // supposed to be populated by scripts after they are finished executing Read
    // more about nodejs vm here - https://nodejs.org/api/vm.html
    const context = vm.createContext({
      db: client.db('script-db'),
      result: null,
    });
    
    // Here we are converting our jsString to be executed into a Script object
    // that can be executed in the secure sandbox
    const script = new vm.Script(jsString);

    // Here we run our script in the secure sandbox that we created earlier
    script.runInContext(context);

    // Here we gather the result of our script execution
    const scriptExecutionResult = await context.result;

    // Here we send the response back with the execution results
    res.json({ result: scriptExecutionResult });
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