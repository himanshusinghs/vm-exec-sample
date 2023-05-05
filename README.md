## How to run?
Type the following in your terminal opened in the root of this repository
- `npm install` (Installs the required modules like mongodb driver and express library)
- `node server.js` (Runs the server)

## How to access the server?
- Use any request client - `curl`, `Postman`, etc.
- The server is listening on port `3000` and the endpoint exposed is called `/execute-query`
- The endpoint `/execute-query` requires a query parameter `scriptname` which is the name of the script (without the extension) to run

Assuming that you are running this locally, the entire request would look like:
```
GET http://localhost:3000/execute-query?scriptname=get-5-reviews
```