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
    database: process.env.DB_NAME,
    dateStrings: true
});

const query = util.promisify(con.query).bind(con);

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const fieldsToSqlColumns = {model_id:"Model_id", model_name:"Model_name", release_date:"Release_date", weight_g:"Weight_g",
    display_size_inch:"Display_size_inch", resolution:"Resolution", camera:"Camera", battery_capacity:"Battery_capacity",
    operating_system:"Operating_system", os_version:"OS_version", category:"Category"};

/**
 * Creates a table in the database with the manufacturer's name provided as a paramater
 */
router.post("/api/v1/manufacturers", async (req, res) => {
    (async () => {
        try {
            const sql = "CREATE TABLE IF NOT EXISTS ?? ( Model_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, Model_name VARCHAR(45) NULL DEFAULT NULL, Release_date DATE NOT NULL, Weight_g SMALLINT(6) NULL DEFAULT NULL, Display_size_inch FLOAT NULL DEFAULT NULL, Resolution VARCHAR(45) NULL DEFAULT NULL, Camera SMALLINT(6) NULL DEFAULT NULL, Battery_capacity SMALLINT(6) NULL DEFAULT NULL, Operating_system VARCHAR(45) NULL DEFAULT NULL, OS_version FLOAT NULL DEFAULT NULL, Category VARCHAR(45) NULL DEFAULT NULL)";
            let manu = req.body.manufacturer;
            await query(sql, manu);
            res.sendStatus(200);
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
            let fieldsToBeInserted = "";
            let valuesToBeInserted = [manufacturer];
            let numberOfValues = "";

            for(let i in json){
                fieldsToBeInserted += fieldsToSqlColumns[i] + ",";
                numberOfValues += "?,";
                if(json[i].length != 0) {
                    valuesToBeInserted.push(json[i]);
                }else{
                    valuesToBeInserted.push(null);
                }
            }

            fieldsToBeInserted = fieldsToBeInserted.substring(0, fieldsToBeInserted.length -1);
            numberOfValues = numberOfValues.substring(0, numberOfValues.length -1);
            
            const sql = "INSERT INTO ?? (" + fieldsToBeInserted + ")  VALUES (" + numberOfValues + ")";
            await query(sql, valuesToBeInserted);
            res.sendStatus(200);
        }catch(err){
            console.error(err);
            res.sendStatus(500);
        }
    }
});

module.exports = router;