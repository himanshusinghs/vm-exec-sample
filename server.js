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
  const script = new vm.Script(jsString);
  const context = vm.createContext({ result: null, db: client.db('script-db') });
  script.runInContext(context);
  // context.result is a promise and hence needs to be awaited
  res.json(await context.result);
});

client.connect()
  .then(() => app.listen(3000, () => console.log('Listening')));