const mongoose = require("mongoose");
const Complaint = require("../models/complaint");
const db = require("./setupTestDB");  

describe("Resident Complaint Module Testing", () => {

  beforeAll(async () => {
    await db.connect();
  });

  beforeEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  test("Resident should be able to create a complaint with valid data", async () => {
    const complaint = await Complaint.create({
      title: "Water Issue",
      body: "Water leakage in Block A",
      createdBy: new mongoose.Types.ObjectId(),
      status: "open"
    });

    expect(complaint).toBeDefined();
    expect(complaint.title).toBe("Water Issue");
    expect(complaint.body).toBe("Water leakage in Block A");
  });

  test("Complaint creation should fail if required fields are missing", async () => {
    let error;

    try {
      await Complaint.create({
        title: "Incomplete Complaint"
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  test("Complaint should have default status if not provided", async () => {
    const complaint = await Complaint.create({
      title: "Lift Issue",
      body: "Lift not working",
      createdBy: new mongoose.Types.ObjectId()
    });

    expect(complaint.status).toBeDefined();
  });
});
