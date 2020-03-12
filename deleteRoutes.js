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
 * Deletes a manufacturer and its product line from database
 */
router.delete("/api/v1/manufacturers/:mfr", async (req, res) => {
	(async () => {
		try {
			const sql = "DROP TABLE IF EXISTS ??";
			let manu = req.params.mfr;
			await query(sql, manu);
			res.sendStatus(200);
		} catch (err) {
			console.error(err);
			res.sendStatus(500);
		}
	})();
});
/**
 * Deletes a phone model (:id) form a manufacturer (:mfr)
 */
router.delete("/api/v1/manufacturers/:mfr/:id", async (req, res) => {
	let manufacturer = req.params.mfr;
	let phoneID = req.params.id;
	(async () => {
		try {
			if(await checkManufacturer()){
				await removePhoneModel();
			}else{
				res.status(500).send("Valmistajaa ei löytynyt");
			}
		} catch (err) {
			console.error(err);
			res.sendStatus(500);
		}
	})();

	/**
	 * Check if manufacturer exists in database
	 * @returns {Promise<boolean>}
	 */
	async function checkManufacturer() {
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
			res.sendStatus(500);
		}
	}

	async function removePhoneModel(){
		try {
			const sql = "DELETE FROM ?? WHERE Model_id=?";
			await query(sql, [manufacturer, phoneID]);
			res.sendStatus(200);
		} catch (err) {
			console.error(err);
			res.sendStatus(500);
		}
	}
});

module.exports = router;