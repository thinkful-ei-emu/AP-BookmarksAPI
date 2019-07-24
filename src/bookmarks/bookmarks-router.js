const express = require("express");
const bookmarksRouter = express.Router();
//const bookmarks = require("../store");
const uuid = require("uuid/v4");
const bodyParser = express.json();
const validUrl = require("valid-url");
const logger = require("../logger");
const BookmarksService = require("../bookmarks-service")


bookmarksRouter
  .route("/bookmarks")
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
    .then(bookmarks => {
      res.json(bookmarks.map(bookmark=>({
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        rating: bookmark.rating,
      })))
    })
    .catch(next)
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;

    if (!title) {
      logger.error(`Title is required`);
      return res.status(400).send("Enter a title");
    }

    if (!url || !validUrl.isUri(url)) {
      logger.error(`Valid URL is required`);
      return res.status(400).send("Enter a valid url");
    }

    if (!description) {
      logger.error(`Description is required`);
      return res.status(400).send("Enter a description");
    }

    if (!rating || rating < 1 || rating > 5) {
      logger.error(`Valid rating is required`);
      return res.status(400).send("Enter a valid rating");
    }

    const bookmark = {
      id: uuid(),
      title,
      url,
      description,
      rating
    };

    bookmarks.push(bookmark);

    logger.info(`Bookmark created.`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark);
  });

bookmarksRouter
  .route("/bookmarks/:id")
  .get((req, res, next) => {
    const { id } = req.params;

    BookmarksService.getById(req.app.get('db'), id)
    .then(bookmark=>{
      if (!bookmark) {
        logger.error(`Bookmark with ${id} does not exist.`);
        return res.status(404).send("404 Not Found");
      }
      res.json({
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        rating: bookmark.rating,
    })
    })
    .catch(next)

   

  })
  .delete((req, res) => {
    const { id } = req.params;

    const index = bookmarks.findIndex(bm => bm.id === id);

    if (index === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Bookmark not found");
    }

    bookmarks.splice(index, 1);

    logger.info(`Bookmark with id ${id} deleted.`);
    res.status(204).end();
  });

module.exports = bookmarksRouter;
