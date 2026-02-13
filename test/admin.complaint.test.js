const mongoose = require("mongoose");
const Complaint = require("../models/complaint");
const db = require("./setupTestDB");  

describe("Admin Complaint Module Testing", () => {

  beforeAll(async () => {
    await db.connect();
  });

  beforeEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  test("Admin should be able to approve a complaint", async () => {
    const complaint = await Complaint.create({
      title: "Water Issue",
      body: "Water leakage in Block A",
      createdBy: new mongoose.Types.ObjectId(),
      status: "open"
    });

    complaint.status = "approved";
    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id);
    expect(updatedComplaint.status).toBe("approved");
  });

  test("Admin should be able to mark complaint as completed", async () => {
    const complaint = await Complaint.create({
      title: "Lift Issue",
      body: "Lift not working",
      createdBy: new mongoose.Types.ObjectId(),
      status: "approved"
    });

    complaint.status = "completed";
    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id);
    expect(updatedComplaint.status).toBe("completed");
  });
});