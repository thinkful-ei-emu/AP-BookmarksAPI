const app = require('../src/app')
const bookmarks = require('../src/store')

describe('GET /bookmarks', () => {
  it('GET /bookmarks shows the list of bookmarks', () => {
    return supertest(app)
      .get('/bookmarks')
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(200, bookmarks)
  })
})

describe('GET /bookmarks/:id', () => {
  it('GET /bookmarks/:id shows targeted bookmark', () => {
    const firstId = "bd5b9402-04c6-4ee6-ba89-e19093235ff9"
    return supertest(app)
      .get(`/bookmarks/${firstId}`)
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(200, bookmarks[0])
  })

  it('Get 404 if id not found', () => {
    return supertest(app)
      .get('/bookmarks/bogus')
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(404, '404 Not Found')
  })
})
