const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeBookmarksArray } = require("./bookmarks.fixtures");

describe.only("Bookmarks Endpoints", function() {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });

    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db("bookmarks").truncate());

  afterEach("cleanup", () => db("bookmarks").truncate());

  describe("GET /bookmarks", () => {
    context("Given no bookmarks", () => {
      it("Returns with 200 and empty list", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });

    context("Given bookmarks has data", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("GET /bookmarks respons with 200 and all bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBookmarks);
      });
    });
  });

  describe("GET /bookmarks/:id", () => {
    context("Given no bookmarks", () => {
      it("responds with 404", () => {
        const bookmarkId = 123;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: "Bookmark does not exist" } });
      });
    });
    context("Given bookmarks has data", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("GET /bookmarks/:id responds with 200 and by id", () => {
        const bookmarkId = 3;
        const expectedBookmark = testBookmarks[bookmarkId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedBookmark);
      });
    });
  });

  describe.only("POST /articles", () => {
    const newBookmark = {
      title: "Test title",
      url: "https://www.google.com",
      description: "Test description",
      rating: 4
    };

    it("creates bookmark, with 201", function() {
      this.retries(3);
      return supertest(app)
        .post("/bookmarks")
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.url).to.eql(newBookmark.url);
          expect(res.body.description).to.eql(newBookmark.description);
          expect(res.body.rating).to.eql(newBookmark.rating);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
        })
        .then(postRes => {
          supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body);
        });
    });

    it("responds with 400 invalid rating if not between 1 and 5", () => {
      const bookmark = {
        title: "test",
        url: "https://www.google.com",
        description: "test",
        rating: "13"
      };
      return supertest(app)
        .post(`/bookmarks`)
        .send(bookmark)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(400, "Enter a valid rating");
    });

    it("responds with 400 invalid url if not valid", () => {
      const bookmark = {
        title: "test",
        url: "test",
        description: "test",
        rating: "3"
      };
      return supertest(app)
        .post(`/bookmarks`)
        .send(bookmark)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(400, "Enter a valid url");
    });

    const requiredFields = ["title", "url", "rating"];
    requiredFields.forEach(field => {
      const newBookmark = {
        title: "Test title",
        url: "https://www.google.com",
        description: "Test description",
        rating: 2
      };

      it(`responds with 400 and error message when ${field} is missing`, () => {
        delete newBookmark[field];

        return supertest(app)
          .post("/bookmarks")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(newBookmark)
          .expect(400, {
            error: { message: `Missing ${field} is request body` }
          });
      });
    });
  });

  describe.only("DELETE /bookmarks/:id", () => {
    context("Given no bookmarks", () => {
      it("responds with 404", () => {
        
        return supertest(app)
          .delete('/bookmarks/123213123')
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Bookmark does not exist` } });
      });
    });
    context("Given bookmarks are in database", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("responds with 204 and removes specified article", () => {
        const idToRemove = 2;
        const expectedBookmark = testBookmarks.filter(
          bookmark => bookmark.id !== idToRemove);
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get("/bookmarks")
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedBookmark);
          });
      });
    });
  });
});
