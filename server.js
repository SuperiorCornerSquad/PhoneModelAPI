const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");
const getRouter = require("./RESTroutes/getRoutes");
const postRouter = require("./RESTroutes/postRoutes");
const updateRouter = require("./RESTroutes/updateRoutes");
const deleteRouter = require("./RESTroutes/deleteRoutes");

app.use(morgan("short"));
app.use(getRouter);
app.use(postRouter);
app.use(updateRouter);
app.use(deleteRouter);
app.use(express.static(__dirname + '/'));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname+"/index.html"));
});
app.get("/get", (req, res) => {
	res.sendFile(path.join(__dirname+"/get.html"));
});
app.get("/post", (req, res) => {
	res.sendFile(path.join(__dirname+"/post.html"));
});
app.get("/update", (req, res) => {
	res.sendFile(path.join(__dirname+"/update.html"));
});
app.get("/delete", (req, res) => {
	res.sendFile(path.join(__dirname+"/delete.html"));
});

app.listen(8081, "localhost",  () => {
	console.log("http://localhost:8081");
});