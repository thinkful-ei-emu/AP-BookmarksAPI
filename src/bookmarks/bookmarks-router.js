const express = require("express");
const bookmarksRouter = express.Router();
const bookmarks = require("../store");

const app = express();

bookmarksRouter.route("/bookmarks").get((req, res) => {
  res.json(bookmarks);
});

bookmarksRouter.route("/bookmarks/:id").get((req, res) => {
    const { id } = req.params;
    const singleBookmark = bookmarks.find(bookmark => bookmark.id == id);

    if (!singleBookmark) {
      logger.error(`Bookmark with ${id} does not exist.`);
      return res.status(404).send("404 Not Found");
    }

    res.json(singleBookmark);
  });

module.exports = bookmarksRouter;
