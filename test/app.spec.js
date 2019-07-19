const app = require("../src/app");
const bookmarks = require("../src/store");

describe("GET /bookmarks", () => {
  it("GET /bookmarks shows the list of bookmarks", () => {
    return supertest(app)
      .get("/bookmarks")
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(200, bookmarks);
  });
});

describe("GET /bookmarks/:id", () => {
  it("GET /bookmarks/:id shows targeted bookmark", () => {
    const firstId = "bd5b9402-04c6-4ee6-ba89-e19093235ff9";
    return supertest(app)
      .get(`/bookmarks/${firstId}`)
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(200, bookmarks[0]);
  });

  it("Get 404 if id not found", () => {
    return supertest(app)
      .get("/bookmarks/bogus")
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(404, "404 Not Found");
  });
});

describe("POST /bookmarks", () => {
  it("POST /bookmarks works correctly", () => {
    const dummy = {
      title: "Google",
      url: "https://www.google.com",
      description: "Search some things",
      rating: "5"
    };

    return supertest(app)
      .post("/bookmarks")
      .send(dummy)
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(201)
      .then(res => {
        expect(res.body.title).to.eql(dummy.title);
        expect(res.body.url).to.eql(dummy.url);
        expect(res.body.description).to.eql(dummy.description);
        expect(res.body.rating).to.eql(dummy.rating);
      });
  });

  it("Get 400 if no title", () => {
    const dummy = {
      url: "https://www.google.com",
      description: "Search some things",
      rating: "5"
    };

    return supertest(app)
      .post("/bookmarks")
      .send(dummy)
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(400, "Enter a title");
  });

  it("Get 400 if no url", () => {
    const dummy = {
      title: "Google",
      description: "Search some things",
      rating: "5"
    };

    return supertest(app)
      .post("/bookmarks")
      .send(dummy)
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(400, "Enter a valid url");
  });

  it("Get 400 if not valid url", () => {
    const dummy = {
      title: "Google",
      url: "dummy",
      description: "Search some things",
      rating: "5"
    };

    return supertest(app)
      .post("/bookmarks")
      .send(dummy)
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(400, "Enter a valid url");
  });

  it("Get 400 if no description", () => {
    const dummy = {
      title: "Google",
      url: "https://www.google.com",
      rating: "5"
    };

    return supertest(app)
      .post("/bookmarks")
      .send(dummy)
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(400, "Enter a description");
  });

  it("Get 400 if no rating", () => {
    const dummy = {
      title: "Google",
      url: "https://www.google.com",
      description: "Search some things"
    };

    return supertest(app)
      .post("/bookmarks")
      .send(dummy)
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(400, "Enter a valid rating");
  });

  it("Get 400 if rating is greater than 5 or less than 1", () => {
    const dummy = {
      title: "Google",
      url: "https://www.google.com",
      description: "Search some things",
      // "rating": 14,
      rating: -1
    };

    return supertest(app)
      .post("/bookmarks")
      .send(dummy)
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(400, "Enter a valid rating");
  });
});

describe("DELETE /bookmarks/:id", () => {
  let id = "8e6eb7c2-21ea-40c3-9908-5c9db505fcb7";

  it("DELETE /bookmarks/:id responds with 204 and deletes bookmark by id", () => {
    return supertest(app)
      .del(`/bookmarks/${id}`)
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(204);
  });

  it("Delete returns 404 if bookmark not found", () => {
    return supertest(app)
      .del("/bookmarks/123213123123")
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(404, "Bookmark not found");
  });
});
