const express = require("express");
const bookmarksRouter = express.Router();
const bookmarks = require("../store");
const uuid = require('uuid/v4')
const bodyParser = express.json()
const validUrl = require('valid-url'); 

const app = express();

bookmarksRouter
.route("/bookmarks")
.get((req, res) => {
  res.json(bookmarks);
})
.post(bodyParser, (req, res)=>{
    const {title, url, description, rating} = req.body;


    if(!title){
        return res.status(400).send('Enter a title')
    }

    if(!url || !validUrl.isUri(url)){
        return res.status(400).send('Enter a valid url')
    }

    if(!description){
        return res.status(400).send('Enter a description')
    }

    if(!rating || rating < 0 || rating > 5){
        return res.status(400).send('Enter a valid rating')
    }

    const bookmark = {
        id: uuid(),
        title,
        url,
        description,
        rating
        }

    bookmarks.push(bookmark)

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark)
})

bookmarksRouter.route("/bookmarks/:id").get((req, res) => {
    const { id } = req.params;
    const singleBookmark = bookmarks.find(bookmark => bookmark.id == id);

    if (!singleBookmark) {
      //logger.error(`Bookmark with ${id} does not exist.`);
      return res.status(404).send("404 Not Found");
    }

    res.json(singleBookmark);
  });

module.exports = bookmarksRouter;
