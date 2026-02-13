const mongoose = require("mongoose");
const Notice = require("../models/notice");
const db = require("./setupTestDB"); 

describe("Notice Module Testing", () => {

  beforeAll(async () => {
    await db.connect();
  });

  beforeEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  test("Notice should be created with valid data", async () => {
    const notice = await Notice.create({
      title: "Water Supply Interruption",
      body: "Water supply will be off from 10 AM to 2 PM",
      author: new mongoose.Types.ObjectId()
    });

    expect(notice).toBeDefined();
    expect(notice.title).toBe("Water Supply Interruption");
    expect(notice.body).toBe("Water supply will be off from 10 AM to 2 PM");
  });

  test("Notice creation should fail if required fields are missing", async () => {
    let error;

    try {
      await Notice.create({
        title: "Incomplete Notice"
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  test("Notice should automatically set createdAt date", async () => {
    const notice = await Notice.create({
      title: "Maintenance Update",
      body: "Lift maintenance scheduled tomorrow",
      author: new mongoose.Types.ObjectId()
    });

    expect(notice.createdAt).toBeDefined();
  });
});