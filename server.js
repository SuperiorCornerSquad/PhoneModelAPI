const express = require("express");
const app = express();
const morgan = require("morgan");
const router = require("./routes");

app.use(morgan("short"));
app.use(router);

app.listen(8081, "localhost",  () => {
	console.log("http://localhost:8081");
});