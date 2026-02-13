process.env.NODE_ENV = "test";

jest.mock("../models/user", () => {
  const users = [];

  return {
    create: jest.fn(async (data) => {
      const exists = users.find(u => u.email === data.email);
      if (exists) throw new Error("User already exists");

      const user = { ...data, _id: Date.now().toString() };
      users.push(user);
      return user;
    }),

    findOne: jest.fn(async (query) => {
      return users.find(u => u.email === query.email) || null;
    }),

    deleteMany: jest.fn(async () => {
      users.length = 0;
    })
  };
});

jest.mock("../config/redis", () => ({
  connectRedis: jest.fn(() => Promise.resolve()),
  redisClient: { isOpen: false },
  subClient: {}
}));

jest.mock("../utils/wsManager", () => ({
  initWebSocket: jest.fn()
}));

const request = require("supertest");
const app = require("../index");
const User = require("../models/user");

describe("Auth Module Testing (Signup & Login)", () => {

  beforeEach(async () => {
    await User.deleteMany();
  });

  test("Signup should work with valid data", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "test@gmail.com",
        password: "12345"
      });

    expect(res.statusCode).toBe(201);
  });

  test("Signup should fail for duplicate email", async () => {
    await User.create({
      name: "User",
      email: "dup@gmail.com",
      password: "12345"
    });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Another",
        email: "dup@gmail.com",
        password: "67890"
      });

    expect(res.statusCode).toBe(400);
  });

  test("Login should work with correct credentials", async () => {
    await User.create({
      name: "Login User",
      email: "login@gmail.com",
      password: "12345"
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@gmail.com",
        password: "12345"
      });

    expect(res.statusCode).toBe(200);
  });

  test("Login should fail with wrong password", async () => {
    await User.create({
      name: "User",
      email: "wrong@gmail.com",
      password: "12345"
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@gmail.com",
        password: "wrongpass"
      });

    expect(res.statusCode).toBe(400);
  });
});