const vm = require('node:vm');
const app = require('express')();
const { MongoClient } = require("mongodb");
const uri = "your-connection-string-here";
const client = new MongoClient(uri);

app.post('/execute', async function (req, res) {
  // This string will be coming in from req.body
  // const jsString = req.body.jsString;
  const jsString = `
    result = (async () => {
      const collection = db.collection('sample-collection');
      return await collection.findOne({});
    })()
  `;

  // Read more about nodejs vm here - https://nodejs.org/api/vm.html
  const script = new vm.Script(jsString);
  const context = vm.createContext({ result: null, db: client.db('script-db') });
  script.runInContext(context);
  // context.result is a promise and hence needs to be awaited
  res.json(await context.result);
});

// Read more about mongodb drivers here - https://www.mongodb.com/docs/drivers/node/current/quick-start/
client.connect()
  .then(() => app.listen(3000, () => console.log('Listening')));