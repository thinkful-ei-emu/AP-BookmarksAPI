const express = require("express");
const bookmarksRouter = express.Router();
//const bookmarks = require("../store");
const uuid = require("uuid/v4");
const bodyParser = express.json();
const validUrl = require("valid-url");
const logger = require("../logger");
const BookmarksService = require("../bookmarks-service");

bookmarksRouter
  .route("/bookmarks")
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get("db"))
      .then(bookmarks => {
        res.json(
          bookmarks.map(bookmark => ({
            id: bookmark.id,
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description,
            rating: bookmark.rating
          }))
        );
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;

    for (const field of ['title', 'url', 'rating']){
      if(!req.body[field]){
        logger.error(`Missing ${field} is request body`)
        return res.status(400).send({
          error: {message: `Missing ${field} is request body`}
        })
      }
    }


    if (!validUrl.isUri(url)) {
      logger.error(`Valid URL is required`);
      return res.status(400).send("Enter a valid url");
    }

    if (rating < 1 || rating > 5) {
      logger.error(`Valid rating is required`);
      return res.status(400).send("Enter a valid rating");
    }

    const bookmark = {
      title,
      url,
      description,
      rating
    };

    BookmarksService.insertBookmark(req.app.get("db"), bookmark)
      .then(bookmark => {
        logger.info(`Bookmark created with id ${bookmark.id}.`);
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json({
              id: bookmark.id,
              title: bookmark.title,
              url: bookmark.url,
              description: bookmark.description,
              rating: bookmark.rating
            })
  })
  .catch(next)
  })

bookmarksRouter
  .route("/bookmarks/:id")
  .all((req, res, next)=>{
    BookmarksService.getById(
      req.app.get('db'),
      req.params.id
    )
    .then(bookmark=>{
      if(!bookmark){
        return res.status(404).json({
          error: {message: 'Bookmark does not exist'}
        })
      }
      res.bookmark = bookmark
      next()
    })
    .catch(next)
  })
  .get((req, res, next) => {
        res.json({
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          rating: bookmark.rating
        });
  })
  .delete((req, res, next) => {
    const { id } = req.params;

    BookmarksService.deleteBookmark(
      req.app.get('db'),
      id
    )
    .then(() =>{
      logger.info(`Bookmark with id ${id} deleted.`);
      res.status(204).end();
    })
    .catch(next)
  });

module.exports = bookmarksRouter;
