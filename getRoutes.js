const express = require("express");
const router = express.Router();
const util = require("util");
const url = require("url");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
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
router.use(cors());

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
	let fieldsToSqlColumns = {id:"Model_id", model:"Model_name", releaseDate:"Release_date", weight:"Weight_g",
		displaySize:"Display_size_inch", resolution:"Resolution", cameraRes:"Camera", batteryCpty:"Battery_capacity",
		os:"Operating_system", osVersion:"OS_version", category:"Category"};
	let mfr = req.params.mfr;
	let fields;
	if(typeof req.query.fields !== 'undefined') fields = req.query.fields.split(",");
	let queries = {afterDate:req.query.afterDate, beforeDate:req.query.beforeDate, minWeight:req.query.minWeight,
		maxWeight:req.query.maxWeight, minDisplaySize:req.query.minDisplaySize, maxDisplaySize:req.query.maxDisplaySize,
		minCameraRes:req.query.minCameraRes, maxCameraRes:req.query.maxCameraRes, minBatteryCpty:req.query.minBatteryCpty,
		maxBatteryCpty:req.query.maxBatteryCpty, minOsVersion:req.query.minOsVersion, maxOsVersion:req.query.maxOsVersion};

	function areQueriesUndefined() {
		for (let key in queries) {
			if (typeof queries[key] !== 'undefined')
				return false;
		}
		return true;
	}

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

	async function createSqlQuery(manufacturers) {
		try {
			let hasMfr = false;
			for (let i=0; i<manufacturers.length; i++) { // Katsotaan onko mfr:ää olemassa
				if(manufacturers[i].table_name === mfr) hasMfr = true;
			}
			if(!hasMfr) throw `'${mfr}' is not a valid route`;
			let sqlQuery = "SELECT ";
			if (typeof fields === 'undefined') { // Katsotaan jos fields valueita on. Jos ei SELECT FROM *;
				let validated = con.format("* FROM ??", mfr);
				sqlQuery = sqlQuery.concat(validated);
			} else {
				let sqlFields = [];
				for (let i in fields) {
					if(typeof fieldsToSqlColumns[fields[i]] === 'undefined') throw `'${fields[i]}' is not a possible value for fields`;
					sqlFields.push(fieldsToSqlColumns[fields[i]]);
				}
				sqlQuery = sqlQuery.concat(sqlFields.join() + con.format(" FROM ??", mfr)); // SELECT field,field,field FROM manufacturer;
			}

			let amountOfQueries = Object.keys(req.query).length;
			if(amountOfQueries === 1 && typeof fields !== 'undefined' || areQueriesUndefined()) { // Katsotaan onko vain fields queryja tai jos queryja ei ole ollenkaan.
				console.log(sqlQuery);
				return sqlQuery;
			} else {	// Jos kaikki queryt undefined niin ei tänne
				sqlQuery = sqlQuery.concat(" WHERE ");
				for(let key in queries) { // Käydään queryt läpi
					if(typeof queries[key] !== 'undefined') { // Katsotaan onko querya olemassa
						switch (key) {
							case "afterDate":
								sqlQuery = sqlQuery.concat(con.format("Release_date >= ?", queries[key]));
								break;
							case "beforeDate":
								sqlQuery = sqlQuery.concat(con.format("Release_date <= ?", queries[key]));
								break;
							case "minWeight":
								sqlQuery = sqlQuery.concat(con.format("Weight_g >= ?", queries[key]));
								break;
							case "maxWeight":
								sqlQuery = sqlQuery.concat(con.format("Weight_g <= ?", queries[key]));
								break;
							case "minDisplaySize":
								sqlQuery = sqlQuery.concat(con.format("Display_size_inch >= ?", queries[key]));
								break;
							case "maxDisplaySize":
								sqlQuery = sqlQuery.concat(con.format("Display_size_inch <= ?", queries[key]));
								break;
							case "minCameraRes":
								sqlQuery = sqlQuery.concat(con.format("Camera >= ?", queries[key]));
								break;
							case "maxCameraRes":
								sqlQuery = sqlQuery.concat(con.format("Camera <= ?", queries[key]));
								break;
							case "minBatteryCpty":
								sqlQuery = sqlQuery.concat(con.format("Battery_capacity >= ?", queries[key]));
								break;
							case "maxBatteryCpty":
								sqlQuery = sqlQuery.concat(con.format("Battery_capacity <= ?", queries[key]));
								break;
							case "minOsVersion":
								sqlQuery = sqlQuery.concat(con.format("OS_version >= ?", queries[key]));
								break;
							case "maxOsVersion":
								sqlQuery = sqlQuery.concat(con.format("OS_version <= ?", queries[key]));
								break;
							default:
								throw "Something went extremely wrong!";
						}
						sqlQuery = sqlQuery.concat(" AND ");
					}
				}
				sqlQuery = sqlQuery.slice(0, -5); // Poistetaam ylimääräinen " AND " lauseen lopusta.
				console.log(sqlQuery);
				return sqlQuery;
			}

		} catch (err) {
			console.error("Error: " + err);
			res.status(500).send("Invalid query: "+err);
		}
	}

	(async () => {
		let mfr = await  getManufacturers();
		let sql = await createSqlQuery(mfr);
		let result = await query(sql);
		res.json(result);
	})();
});

router.get("/api/v1/manufacturers/:mfr/:id", (req, res) => {
	let fieldsToSqlColumns = {id:"Model_id", model:"Model_name", releaseDate:"Release_date", weight:"Weight_g",
		displaySize:"Display_size_inch", resolution:"Resolution", cameraRes:"Camera", batteryCpty:"Battery_capacity",
		os:"Operating_system", osVersion:"OS_version", category:"Category"};
	let mfr = req.params.mfr.toLowerCase();
	let id = req.params.id;
	let fields;
	if(typeof req.query.fields !== 'undefined') fields = req.query.fields.split(",");

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

	async function createSqlQuery(manufacturers) {
		try {
			let hasMfr = false;
			for (let i=0; i<manufacturers.length; i++) { // Katsotaan onko mfr:ää olemassa
				if(manufacturers[i].table_name === mfr) hasMfr = true;
			}
			if(!hasMfr) throw `'${mfr}' is not a valid route`;
			let sqlQuery = "SELECT ";
			if (typeof fields === 'undefined') { // Katsotaan jos fields valueita on. Jos ei SELECT FROM *;
				let validated = con.format("* FROM ??", mfr);
				sqlQuery = sqlQuery.concat(validated);
			} else {
				let sqlFields = [];
				for (let i in fields) {
					if(typeof fieldsToSqlColumns[fields[i]] === 'undefined') throw `'${fields[i]}' is not a possible value for fields`;
					sqlFields.push(fieldsToSqlColumns[fields[i]]);
				}
				sqlQuery = sqlQuery.concat(sqlFields.join() + con.format(" FROM ??", mfr)); // SELECT field,field,field FROM manufacturer;
			}

			sqlQuery = sqlQuery.concat(con.format(" WHERE Model_id = ?", id));
			let amountOfQueries = Object.keys(req.query).length;
			if(amountOfQueries === 1 && typeof fields !== 'undefined' || amountOfQueries === 0) { // Katsotaan onko vain fields queryja tai jos ei ole queryja ollenkaan.
				console.log(sqlQuery);
				return sqlQuery;
			} else {
				throw "Only 'fields' parameter is allowed!";
			}
		} catch (err) {
			console.error("Error: " + err);
			res.status(500).send("Invalid query: "+err);
		}
	}

	(async () => {
		let mfr = await getManufacturers();
		let sql = await createSqlQuery(mfr);
		let result = await query(sql);
		res.json(result);
	})();
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