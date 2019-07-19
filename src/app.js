require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const winston = require("winston");
const uuid = require("uuid/v4");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

const bookmarks = [
  {
    id: "bd5b9402-04c6-4ee6-ba89-e19093235ff9",
    title: "Google",
    url: "https://www.google.com",
    description: "Search some things",
    rating: 1
  },

  {
    id: "5a31bb52-c468-433f-a784-49734266b8cd",
    title: "Facebook",
    url: "https://www.facebook.com",
    description: "Look people up",
    rating: 2
  },

  {
    id: "8e6eb7c2-21ea-40c3-9908-5c9db505fcb7",
    title: "Twitter",
    url: "https://www.twitter.com",
    description: "Tweet some stuff",
    rating: 3
  }
];

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "info.log" })]
});

if (NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
});

app.get("/", (req, res) => {
  res.json("Hello World");
});

app.get("/bookmarks", (req, res) => {
  res.json(bookmarks);
});

app.get("/bookmarks/:id", (req, res) => {
  const { id } = req.params;
  const singleBookmark = bookmarks.find(bookmark => bookmark.id == id);

  // make sure we found a card
  if (!singleBookmark) {
    logger.error(`Bookmark with ${id} does not exist.`);
    return res.status(404).send("Bookmark not found");
  }

  res.json(singleBookmark);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.log(error);
    response = { message: error.message, error };
  }

  res.status(500).json(response);
});

module.exports = app;
