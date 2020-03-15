const express = require("express");
const router = express.Router();
const util = require("util");
const url = require("url");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();

const con = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	dateStrings: true
});
const query = util.promisify(con.query).bind(con);

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

let fieldsToSqlColumns = {id:"Model_id", model:"Model_name", releaseDate:"Release_date", weight:"Weight_g",
	displaySize:"Display_size_inch", resolution:"Resolution", cameraRes:"Camera", batteryCpty:"Battery_capacity",
	os:"Operating_system", osVersion:"OS_version", category:"Category"};

/**
 * Gets all manufacturers in the database and responds with a json list of all the manufacturers.
 */
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

/**
 * Gets all phones of the manufacturer that has been provided in the url.
 * Also checks for any parameters given in the url and provides the data according to those.
 * Responds with a json list of all phone objects.
 */
router.get("/api/v1/manufacturers/:mfr", (req, res) => {
	let mfr = req.params.mfr;
	let fields;
	if(typeof req.query.fields !== 'undefined') fields = req.query.fields.split(",");
	let queries = {afterDate:req.query.afterDate, beforeDate:req.query.beforeDate, minWeight:req.query.minWeight,
		maxWeight:req.query.maxWeight, minDisplaySize:req.query.minDisplaySize, maxDisplaySize:req.query.maxDisplaySize,
		minCameraRes:req.query.minCameraRes, maxCameraRes:req.query.maxCameraRes, minBatteryCpty:req.query.minBatteryCpty,
		maxBatteryCpty:req.query.maxBatteryCpty, minOsVersion:req.query.minOsVersion, maxOsVersion:req.query.maxOsVersion};

	/**
	 * Checks if there are any queries in the given url.
	 * @returns {boolean}
	 */
	function areQueriesUndefined() {
		for (let key in queries) {
			if (typeof queries[key] !== 'undefined')
				return false;
		}
		return true;
	}

	/**
	 * Returns all the manufacturers in the database.
	 * @returns {Promise<any>}
	 */
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

	/**
	 * Creates the sql query that is used to get the phones.
	 * Checks all the given parameters in the url and inserts them into the sql query.
	 * @param manufacturers
	 * @returns {Promise<string>}
	 */
	async function createSqlQuery(manufacturers) {
		try {
			let hasMfr = false;
			for (let i=0; i<manufacturers.length; i++) { // Katsotaan onko mfr:ää olemassa
				if(manufacturers[i].table_name === mfr) hasMfr = true;
			}
			if(!hasMfr) throw `'${mfr}' is not a valid route`;
			let sqlQuery = "SELECT ";
			if (typeof fields === 'undefined') { // Katsotaan jos fields valueita on. Jos ei SELECT * FROM;
				sqlQuery = sqlQuery.concat(con.format("* FROM ??", mfr));
			} else {
				let sqlFields = [];
				for (let i in fields) {
					if(typeof fieldsToSqlColumns[fields[i]] === 'undefined') throw `'${fields[i]}' is not a possible value for fields`;
					sqlFields.push(fieldsToSqlColumns[fields[i]]);
				}
				sqlQuery = sqlQuery.concat(sqlFields.join() + con.format(" FROM ??", mfr)); // SELECT field,field,field FROM manufacturer;
			}

			let amountOfQueries = Object.keys(req.query).length;
			// ISON if elsen alku
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
			} // ISON if elsen loppu

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

/**
 * Gets a phone with the specified manufacturer and id that have been provided in the url.
 * Also checks for any parameters given in the url and provides the data according to those.
 * Responds with a json list that has an object of the specified phone and its contents inside it.
 */
router.get("/api/v1/manufacturers/:mfr/:id", (req, res) => {
	let mfr = req.params.mfr.toLowerCase();
	let id = req.params.id;
	let fields;
	if(typeof req.query.fields !== 'undefined') fields = req.query.fields.split(",");

	/**
	 * Returns all the manufacturers in the database.
	 * @returns {Promise<any>}
	 */
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

	/**
	 * Creates the sql query that is used to get the phone.
	 * Checks for the fields parameter in the url and inserts its values into the sql query.
	 * @param manufacturers
	 * @returns {Promise<string>}
	 */
	async function createSqlQuery(manufacturers) {
		try {
			let hasMfr = false;
			for (let i=0; i<manufacturers.length; i++) { // Katsotaan onko mfr:ää olemassa
				if(manufacturers[i].table_name === mfr) hasMfr = true;
			}
			if(!hasMfr) throw `'${mfr}' is not a valid route`;
			let sqlQuery = "SELECT ";
			if (typeof fields === 'undefined') { // Katsotaan jos fields valueita on. Jos ei SELECT * FROM;
				sqlQuery = sqlQuery.concat(con.format("* FROM ??", mfr));
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

/**
 * Gets smartphones from the database.
 * Also checks for any parameters given in the url and provides the data according to those.
 * Responds with a json list of all smartphone objects.
 */
router.get("/api/v1/smartphones", (req, res) => {
	let fields;
	if(typeof req.query.fields !== 'undefined') fields = req.query.fields.split(",");
	let queries = {afterDate:req.query.afterDate, beforeDate:req.query.beforeDate, minWeight:req.query.minWeight,
		maxWeight:req.query.maxWeight, minDisplaySize:req.query.minDisplaySize, maxDisplaySize:req.query.maxDisplaySize,
		minCameraRes:req.query.minCameraRes, maxCameraRes:req.query.maxCameraRes, minBatteryCpty:req.query.minBatteryCpty,
		maxBatteryCpty:req.query.maxBatteryCpty, minOsVersion:req.query.minOsVersion, maxOsVersion:req.query.maxOsVersion};

	/**
	 * Checks if there are any queries in the given url.
	 * @returns {boolean}
	 */
	function areQueriesUndefined() {
		for (let key in queries) {
			if (typeof queries[key] !== 'undefined')
				return false;
		}
		return true;
	}

	/**
	 * Returns all the manufacturers in the database.
	 * @returns {Promise<any>}
	 */
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

	/**
	 * Creates the sql query for getting smartphones from the database.
	 * Checks for parameters in the url and inserts them into the sql query.
	 * @param manufacturers
	 * @returns {Promise<string>}
	 */
	async function getPhones(manufacturers) {
		try {
			let sqlQuery = "";
			for (let i=0; i<manufacturers.length; i++) {
				sqlQuery = sqlQuery.concat("SELECT ");
				if (typeof fields === 'undefined') { // Katsotaan jos fields valueita on. Jos ei SELECT * FROM ;
					sqlQuery = sqlQuery.concat(con.format("* FROM ??", manufacturers[i].table_name));
				} else {
					let sqlFields = [];
					for (let i in fields) {
						if(typeof fieldsToSqlColumns[fields[i]] === 'undefined') throw `'${fields[i]}' is not a possible value for fields`;
						sqlFields.push(fieldsToSqlColumns[fields[i]]);
					}
					sqlQuery = sqlQuery.concat(sqlFields.join() + con.format(" FROM ??", manufacturers[i].table_name)); // SELECT field,field,field FROM manufacturer;
				}

				sqlQuery = sqlQuery.concat(" WHERE Category='smartphone'");

				let amountOfQueries = Object.keys(req.query).length;
				if(amountOfQueries === 1 && typeof fields !== 'undefined' || areQueriesUndefined()) { // Katsotaan onko vain fields queryja tai jos queryja ei ole ollenkaan.
					console.log("fields found. OR some queries are mispelled");
				} else {	// Jos kaikki queryt undefined niin ei tänne
					for(let key in queries) { // Käydään queryt läpi
						if(typeof queries[key] !== 'undefined') { // Katsotaan onko querya olemassa
							sqlQuery = sqlQuery.concat(" AND ");
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
						}
					}
				}

				if(i !== manufacturers.length-1) {
					sqlQuery = sqlQuery.concat(" UNION ");
				}
			}
			console.log(sqlQuery);
			return sqlQuery;
		} catch(err) {
			console.error("Error: " + err);
			res.status(500).send("Invalid query: "+err);
		}
	}

	(async () => {
		let manufacturers = await getManufacturers();
		let sql = await getPhones(manufacturers);
		let result = await query(sql);
		res.json(result);
	})();
});

/**
 * Gets phablets (phone-tablets) from the database.
 * Also checks for any parameters given in the url and provides the data according to those.
 * Responds with a json list of all phablet objects.
 */
router.get("/api/v1/phablets", (req, res) => {
	let fields;
	if(typeof req.query.fields !== 'undefined') fields = req.query.fields.split(",");
	let queries = {afterDate:req.query.afterDate, beforeDate:req.query.beforeDate, minWeight:req.query.minWeight,
		maxWeight:req.query.maxWeight, minDisplaySize:req.query.minDisplaySize, maxDisplaySize:req.query.maxDisplaySize,
		minCameraRes:req.query.minCameraRes, maxCameraRes:req.query.maxCameraRes, minBatteryCpty:req.query.minBatteryCpty,
		maxBatteryCpty:req.query.maxBatteryCpty, minOsVersion:req.query.minOsVersion, maxOsVersion:req.query.maxOsVersion};

	/**
	 * Checks if there are any queries in the given url.
	 * @returns {boolean}
	 */
	function areQueriesUndefined() {
		for (let key in queries) {
			if (typeof queries[key] !== 'undefined')
				return false;
		}
		return true;
	}

	/**
	 * Returns all the manufacturers in the database.
	 * @returns {Promise<any>}
	 */
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

	/**
	 * Creates the sql query for getting phablets (phone-tablets) from the database.
	 * Checks for parameters in the url and inserts them into the sql query.
	 * @param manufacturers
	 * @returns {Promise<string>}
	 */
	async function getPhablets(manufacturers) {
		try {
			let sqlQuery = "";
			for (let i=0; i<manufacturers.length; i++) {
				sqlQuery = sqlQuery.concat("SELECT ");
				if (typeof fields === 'undefined') { // Katsotaan jos fields valueita on. Jos ei SELECT * FROM ;
					sqlQuery = sqlQuery.concat(con.format("* FROM ??", manufacturers[i].table_name));
				} else {
					let sqlFields = [];
					for (let i in fields) {
						if(typeof fieldsToSqlColumns[fields[i]] === 'undefined') throw `'${fields[i]}' is not a possible value for fields`;
						sqlFields.push(fieldsToSqlColumns[fields[i]]);
					}
					sqlQuery = sqlQuery.concat(sqlFields.join() + con.format(" FROM ??", manufacturers[i].table_name)); // SELECT field,field,field FROM manufacturer;
				}

				sqlQuery = sqlQuery.concat(" WHERE Category='phablet'");

				let amountOfQueries = Object.keys(req.query).length;
				if(amountOfQueries === 1 && typeof fields !== 'undefined' || areQueriesUndefined()) { // Katsotaan onko vain fields queryja tai jos queryja ei ole ollenkaan.
					console.log("fields found. OR some queries are mispelled");
				} else {	// Jos kaikki queryt undefined niin ei tänne
					for(let key in queries) { // Käydään queryt läpi
						if(typeof queries[key] !== 'undefined') { // Katsotaan onko querya olemassa
							sqlQuery = sqlQuery.concat(" AND ");
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
						}
					}
				}

				if(i !== manufacturers.length-1) {
					sqlQuery = sqlQuery.concat(" UNION ");
				}
			}
			console.log(sqlQuery);
			return sqlQuery;
		} catch(err) {
			console.error("Error: " + err);
			res.status(500).send("Invalid query: "+err);
		}
	}

	(async () => {
		let manufacturers = await getManufacturers();
		let sql = await getPhablets(manufacturers);
		let result = await query(sql);
		res.json(result);
	})();
});

module.exports = router;