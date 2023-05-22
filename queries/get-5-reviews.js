/**
 * These scripts are written in Javascript and the database operations follows
 * mongodb driver syntax, read more about it here -
 * https://www.mongodb.com/docs/drivers/node/current/quick-start/
 *
 * Scripts will have access two variables from global scope
 * 1. `db` - A mongodb database object to perform database operations
 * 2. `passResult` - A function which is supposed to be called by the scripts when they want to pass back a value other than cursor or promise
 * 3. `passCursor` - A function which is supposed to be called by the scripts when they want to pass back a cursor
 */

// Since the db here is a database object from mongodb drivers, we need to first
// get a collection instance to make a find query
const listingsAndReviewsCollection = db.collection('listingsAndReviews');

// Now on that collection instance we can execute our find query

// To pass a simple value (not a cursor) this kind of syntax will work
// listingsAndReviewsCollection.find({}, { _id: 1, name: 1 }).limit(5).toArray()
//   .then((result) => passResult(result))

// To pass back a cursor this will work, because the result of find operation is a cursor
passCursor(
  listingsAndReviewsCollection.find({}, { _id: 1, name: 1 })
);
