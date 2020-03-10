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

/**
 * Creates a table in the database with the manufacturer's name provided as a paramater
 */
router.post("/api/v1/manufacturers", async (req, res) => {
    (async () => {
        try {
            const sql = "CREATE TABLE IF NOT EXISTS ?? ( Model_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, Model_name VARCHAR(45) NULL DEFAULT NULL, Release_date DATE NOT NULL, Weight_g SMALLINT(6) NULL DEFAULT NULL, Display_size_inch FLOAT NULL DEFAULT NULL, Resolution VARCHAR(45) NULL DEFAULT NULL, Camera SMALLINT(6) NULL DEFAULT NULL, Battery_capacity SMALLINT(6) NULL DEFAULT NULL, Operating_system VARCHAR(45) NULL DEFAULT NULL, OS_version FLOAT NULL DEFAULT NULL, Category VARCHAR(45) NULL DEFAULT NULL)";
            let manu = req.query.manufacturer;
            await query(sql, manu);
            res.end();
        } catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    })();
});

/**
 * Inserts into database smartphone data of manufacturer provided as :mfr, if the manufacturer does not exist,
 * a new table is created.
 * phone data must be provided in json format in the request (req)
 */
router.post("/api/v1/manufacturers/:mfr", (req, res) => {
    let manufacturer = req.params.mfr;
    let json = req.body;

    //insert the json datafield values into the database
    (async () => {
        try {
            await checkManufacturer();
            await insertDataIntoDatabase();
        }catch(err){
            console.error(err);
            res.sendStatus(500);
        }
    })();

    /**
     * Checks if the manufacturer exists in the database, and creates it if not.
     * @returns {Promise<void>}
     */
    async function checkManufacturer() {
        try {
            const sql = "CREATE TABLE IF NOT EXISTS ?? ( Model_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, Model_name VARCHAR(45) NULL DEFAULT NULL, Release_date DATE NOT NULL, Weight_g SMALLINT(6) NULL DEFAULT NULL, Display_size_inch FLOAT NULL DEFAULT NULL, Resolution VARCHAR(45) NULL DEFAULT NULL, Camera SMALLINT(6) NULL DEFAULT NULL, Battery_capacity SMALLINT(6) NULL DEFAULT NULL, Operating_system VARCHAR(45) NULL DEFAULT NULL, OS_version FLOAT NULL DEFAULT NULL, Category VARCHAR(45) NULL DEFAULT NULL)";
            await query(sql, manufacturer);
        }catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }

    /**
     * Inserts the json data into sql database and ends the transaction
     * @returns {Promise<void>}
     */
    async function insertDataIntoDatabase() {
        try {
            const sql = "INSERT INTO ?? (Model_name, Release_date, Weight_g, Display_size_inch, Resolution, Camera, Battery_capacity, Operating_system, OS_version, Category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            await query(sql, [manufacturer, json.Model_name, json.Release_date, json.Weight_g, json.Display_size_inch, json.Resolution, json.Camera, json.Battery_capacity, json.Operating_system, json.OS_version, json.Category]);
            res.end();
        }catch(err){
            console.error(err);
            res.sendStatus(500);
        }
    }
});
/**
 * Updates the name of a manufacturer given as a parameter
 * The update data must be provided in json format in the request (req)
 */
router.put("/api/v1/manufacturers/:mfr", async (req, res) => {
    let oldName = req.params.mfr;
    let newName = req.body.manufacturer;
    console.log(oldName + newName);
    (async () => {
        try {
            const sql = "RENAME TABLE ?? TO ??";
            await query(sql, [oldName, newName]);
            console.log(oldName + newName);
            res.end();
        } catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    })();
});

/**
 * Updates the data of a smartphone (where phone_id = :id) of manufacturer (:mfr).
 * The update data must be provided in json format in the request (req)
 */
router.put("/api/v1/manufacturers/:mfr/:id", (req, res) => {
    let manufacturer = req.params.mfr;
    let phoneID = req.params.id;
    let json = req.body;

    //update the json datafield values into the database
    (async () => {
        try {
            const sql = "UPDATE ?? SET Model_name = ?, Release_date = ?, Weight_g = ?, Display_size_inch = ?, Resolution = ?, Camera = ?, Battery_capacity = ?, Operating_system = ?, OS_version = ?, Category = ? WHERE Model_id=?";
            await query(sql, [manufacturer, json.Model_name, json.Release_date, json.Weight_g, json.Display_size_inch, json.Resolution, json.Camera, json.Battery_capacity, json.Operating_system, json.OS_version, json.Category, phoneID]);
            res.end();
        }catch(err){
            console.error(err);
            res.sendStatus(500);
        }
    })();
});
module.exports = router;