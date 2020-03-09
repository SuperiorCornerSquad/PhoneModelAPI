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

router.get("/", (req, res) => {
	res.sendFile(path.join(__dirname+"/index.html"));
});

router.get("/api/v1/manufacturers", (req, res) => {
	(async () => {
		try {
			const result = await query("SHOW TABLES");
			const json = [];
			for (let i in result) {
				json.push(result[i].Tables_in_phonemodelapi);
			}
			res.json(json);
		} catch(err) {
			console.error("Database error: " + err);
			res.sendStatus(500);
		}
	})();
});

router.get("/api/v1/manufacturers/:mfr", (req, res) => {
	console.log(req.params.mfr);
	// Object.keys(req.query).length === 0 && req.query.constructor === Object
});

router.get("/api/v1/manufacturers/:mfr/:id", (req, res) => {

});

router.get("/api/v1/smartphones", (req, res) => {

	async function getManufacturers() {
		try {
			let sqlQuery = "SELECT DISTINCT table_name FROM information_schema.columns WHERE column_name ='Category'";
			const result = await query(sqlQuery);
			return result;
		} catch(err) {
			console.error("Database error: " + err);
			res.sendStatus(500);
		}
	}

	async function getPhones(tables) {
		try {
			let sqlQuery = "";
			for (let i=0; i<tables.length; i++) {
				sqlQuery = sqlQuery.concat("SELECT * FROM "+tables[i].table_name+" WHERE Category='smartphone' ");
				if(i !== tables.length-1) {
					sqlQuery = sqlQuery.concat("UNION ");
				}
			}
			const result = await query(sqlQuery);
			res.json(result);
		} catch(err) {
			console.error("Database error: " + err);
			res.sendStatus(500);
		}
	}

	(async () => {
		let tables = await getManufacturers();
		await getPhones(tables);
	})();
});

router.get("/api/v1/phablets", (req, res) => {

	async function getManufacturers() {
		try {
			let sqlQuery = "SELECT DISTINCT table_name FROM information_schema.columns WHERE column_name ='Category'";
			const result = await query(sqlQuery);
			return result;
		} catch(err) {
			console.error("Database error: " + err);
			res.sendStatus(500);
		}
	}

	async function getPhablets(tables) {
		try {
			let sqlQuery = "";
			for (let i=0; i<tables.length; i++) {
				sqlQuery = sqlQuery.concat("SELECT * FROM "+tables[i].table_name+" WHERE Category='phablet' ");
				if(i !== tables.length-1) {
					sqlQuery = sqlQuery.concat("UNION ");
				}
			}
			const result = await query(sqlQuery);
			res.json(result);
		} catch(err) {
			console.error("Database error: " + err);
			res.sendStatus(500);
		}
	}

	(async () => {
		let tables = await getManufacturers();
		await getPhablets(tables);
	})();
});

module.exports = router;