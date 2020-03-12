const express = require("express");
const app = express();
const morgan = require("morgan");
const getRouter = require("./getRoutes");
const postRouter = require("./postRoutes");
const updateRouter = require("./updateRoutes");
const deleteRouter = require("./deleteRoutes");

app.use(morgan("short"));
app.use(getRouter);
app.use(postRouter);
app.use(updateRouter);
app.use(deleteRouter);
app.use(express.static(__dirname + '/'));

app.listen(8081, "localhost",  () => {
	console.log("http://localhost:8081");
});