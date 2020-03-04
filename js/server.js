const express = require("express");
const app = express();
const url = require("url");
const path = require("path");
const util = require("util");
const bodyParser = require("body-parser");
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "example_db"
});
const query = util.promisify(con.query).bind(con);

con.connect(function(err) {
    if (err) throw err;
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(8081, "localhost", function () {
    console.log("http://localhost:8081");
});