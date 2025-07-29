const sql = require("mysql2/promise");
const conn=sql.createPool({
    host:"127.0.0.1",
    user:"root",
    password:"root",
    database:"facecrypt"
})
module.exports = { conn };