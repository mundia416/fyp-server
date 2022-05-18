const query = require("./query");
const mutation = require("./mutation");
const sensors = require("./types/sensors");
const record = require("./types/record");


const { userTypeDef } = require("../libs/auth");





/*##########################################################
 * types that are created should be added to this array
 ###########################################################*/
module.exports = [
   query,
   mutation,
   userTypeDef,
   sensors,
   record
];
