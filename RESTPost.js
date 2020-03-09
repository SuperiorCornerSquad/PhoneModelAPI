const express = require("express");
const router = express.Router();
const util = require("util");
const url = require("url");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql");
require("dotenv").config();

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});
const query = util.promisify(con.query).bind(con);

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
/*
{
Manufacturer: {
    Model_id
    Model_name
    Release_date
    Weight_g
    Display_size_inch
    Resolution
    Camera
    Battery_capacity
    Operating_system
    OS_version
    Category
    }
}
*/
router.post("/api/v1/manufacturers", async (req, res) => {
    (async () => {
        try {
            const sql = "CREATE TABLE IF NOT EXISTS ?? ( Model_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, Model_name VARCHAR(45) NULL DEFAULT NULL, Release_date DATE NOT NULL, Weight_g SMALLINT(6) NULL DEFAULT NULL, Display_size_inch FLOAT NULL DEFAULT NULL, Resolution VARCHAR(45) NULL DEFAULT NULL, Camera SMALLINT(6) NULL DEFAULT NULL, Battery_capacity SMALLINT(6) NULL DEFAULT NULL, Operating_system VARCHAR(45) NULL DEFAULT NULL, OS_version FLOAT NULL DEFAULT NULL, Category VARCHAR(45) NULL DEFAULT NULL)";
            console.log(req.query.manufacturer);
            let manu = req.query.manufacturer;
            const querySQL = query(sql, manu);
            res.end();
        } catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    })();
});

router.post("/api/v1/manufacturers/:mfr", (req, res) => {
    let sql = con.format("SELECT * FROM ? WHERE Model_name=?", [req.body.Manufacturer, req.body.Model_name])
});
module.exports = router;