/**
 * These scripts are written in Javascript and the database operations follows
 * mongodb driver syntax, read more about it here -
 * https://www.mongodb.com/docs/drivers/node/current/quick-start/
 *
 * Scripts will have access two variables from global scope
 * 1. `db` - A mongodb database object to perform database operations
 * 2. `result` - A variable which is supposed to be populated by scripts
 */

// Since the db here is a database object from mongodb drivers, we need to first
// get a collection instance to make a find query
const listingsAndReviewsCollection = db.collection('listingsAndReviews');

// Now on that collection instance we can execute our find query
result = listingsAndReviewsCollection.find({}, { _id: 1, name: 1 }).limit(5).toArray();
