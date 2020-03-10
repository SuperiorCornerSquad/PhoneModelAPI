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
router.get("/get", (req, res) => {
	res.sendFile(path.join(__dirname+"/get.html"));
});
router.get("/post", (req, res) => {
	res.sendFile(path.join(__dirname+"/post.html"));
});
router.get("/update", (req, res) => {
	res.sendFile(path.join(__dirname+"/update.html"));
});
router.get("/delete", (req, res) => {
	res.sendFile(path.join(__dirname+"/delete.html"));
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
			console.error("Error: " + err);
			res.sendStatus(500);
		}
	})();
});

router.get("/api/v1/manufacturers/:mfr", (req, res) => {
	let fieldsToColumns = {id:"Model_id", model:"Model_name", releaseDate:"Release_date", weight:"Weight_g",
		displaySize:"Display_size_inch", resolution:"Resolution", cameraRes:"Camera", batteryCpty:"Battery_capacity",
		os:"Operating_system", osVersion:"OS_version", category:"Category"};
	let mfr = req.params.mfr;
	let fields;
	if(typeof req.query.fields !== 'undefined') fields = req.query.fields.split(",");
	let afterDate = req.query.afterDate;
	let beforeDate = req.query.beforeDate;
	let minWeight = req.query.minWeight;
	let maxWeight = req.query.maxWeight;
	let minDisplaySize = req.query.minDisplaySize;
	let maxDisplaySize = req.query.maxDisplaySize;
	let minCameraRes = req.query.minCameraRes;
	let maxCameraRes = req.query.maxCameraRes;
	let minBatteryCpty = req.query.minBatteryCpty;
	let maxBatteryCpty = req.query.maxBatteryCpty;
	let minOsVersion = req.query.minOsVersion;
	let maxOsVersion = req.query.maxOsVersion;

	// if(typeof afterDate !== 'undefined')

	async function createSqlQuery() {
		try {
			let sqlQuery = "SELECT ";
			if (typeof fields === 'undefined') {
				let validated = con.format(`* FROM ${mfr}`);
				sqlQuery = sqlQuery.concat(validated);
				return sqlQuery;
			} else {
				let sqlFields = [];
				for (let i in fields) {
					if(typeof fieldsToColumns[fields[i]] === 'undefined') {
						throw `No field found with name '${fields[i]}'`;
					}
					sqlFields.push(fieldsToColumns[fields[i]]);
				}
				sqlQuery = sqlQuery.concat(sqlFields.join() + con.format(` FROM ${mfr}`)); // SELECT field,field,field FROM manufacturer;
			}

			/*
			return sqlQuery;*/
		} catch (err) {
			console.error("Error: " + err);
			res.status(500).send("Invalid query: "+err);
		}
	}


	(async () => {
		let sql = await createSqlQuery();
		let result = await query(sql);
		res.json(result);
	})();
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
			console.error("Error: " + err);
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
			console.error("Error: " + err);
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
			console.error("Error: " + err);
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
			console.error("Error: " + err);
			res.sendStatus(500);
		}
	}

	(async () => {
		let tables = await getManufacturers();
		await getPhablets(tables);
	})();
});

module.exports = router;