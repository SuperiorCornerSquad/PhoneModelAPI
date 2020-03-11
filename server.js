const express = require("express");
const app = express();
const morgan = require("morgan");
const getRouter = require("./getRoutes");
const postRouter = require("./postRoutes");

app.use(morgan("short"));
app.use(getRouter);
app.use(postRouter);
app.use(express.static(__dirname + '/'));

app.listen(8081, "localhost",  () => {
	console.log("http://localhost:8081");
});