const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const {makeBookmarksArray} = require('./bookmarks.fixtures')

describe.only("Bookmarks Endpoints", function() {
  
 let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });

    app.set('db', db)
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db("bookmarks").truncate());
  
  afterEach('cleanup', ()=>db('bookmarks').truncate())

  context('Given bookmarks has data', ()=>{
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', ()=>{
          return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('GET /bookmarks respons with 200 and all bookmarks', ()=>{
          return supertest(app)
          .get('/bookmarks')
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBookmarks)
      })

      it('GET /bookmarks/:id responds with 200 and by id', ()=>{
          const bookmarkId = 3
          const expectedBookmark = testBookmarks[bookmarkId - 1]
          return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedBookmark)
          
      })

  })

});
