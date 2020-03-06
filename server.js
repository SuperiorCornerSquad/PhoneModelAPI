const express = require("express");
const app = express();
const url = require("url");
const path = require("path");
const util = require("util");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mysql = require("mysql");
const con = mysql.createConnection({
    host: "localhost",
    user: "apiuser",
    password: "userapi",
    database: "phonemodelapi"
});
const query = util.promisify(con.query).bind(con);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("short"));

app.listen(8081, "localhost",  () => {
    console.log("http://localhost:8081");
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname+"/index.html"));
});