const express = require("express");
const app = express();
const morgan = require("morgan");
const router = require("./routes");
const ihasama = require("./RESTPost")
app.use(morgan("short"));
app.use(router);
app.use(ihasama);
app.use(express.static(__dirname + '/'));

app.listen(8081, "localhost",  () => {
	console.log("http://localhost:8081");
});