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
 * Updates the name of a manufacturer given as a parameter
 * The update data must be provided in json format in the request (req)
 */
router.put("/api/v1/manufacturers/:mfr", async (req, res) => {
	let manufacturer = req.params.mfr;
	let newName = req.body.manufacturer;
	(async () => {
		try {
			if(await checkManufacturer(manufacturer)){
				const sql = "RENAME TABLE ?? TO ??";
				await query(sql, [manufacturer, newName]);
				res.sendStatus(200);
			}else{
				res.status(500).send("Manufacturer not found");
			}
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

	let fieldsToBeUpdated = "";
	let valuesToBeUpdated = [manufacturer];

	for(let i in json){
		fieldsToBeUpdated += fieldsToSqlColumns[i] + "=" + "?" + ",";
		valuesToBeUpdated.push(json[i]);
	}
	valuesToBeUpdated.push(phoneID);
	fieldsToBeUpdated = fieldsToBeUpdated.substring(0, fieldsToBeUpdated.length -1);

	//update the json datafield values into the database
	(async () => {
		try {
			if(await checkManufacturer(manufacturer)) {
				const sql = "UPDATE ?? SET " + fieldsToBeUpdated + " WHERE Model_id=?";
				await query(sql, valuesToBeUpdated);
				res.sendStatus(200);
			}else{
				res.status(500).send("Manufacturer not found");
			}
		}catch(err){
			console.error(err);
			res.sendStatus(500);
		}
	})();
});

/**
 * Check if manufacturer exists in database
 * @returns {Promise<boolean>}
 */
async function checkManufacturer(manufacturer) {
	try {
		const sql = "SHOW TABLES";
		const result = await query(sql);
		for(let i in result){
			if(result[i].Tables_in_phonemodelapi === manufacturer){
				return true;
			}
		}
		return false;
	} catch(err) {
		console.error(err);
	}
}

module.exports = router;