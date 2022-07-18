const express = require("express");
//const morgan = require("morgan");
const path = require("path");
const app = express();

const webRoutes = require("./src/routes/webRoutes");

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  /*   console.log(req.cookies); */
  next();
});

// 3) ROUTES
app.use("/", webRoutes);

module.exports = app;
