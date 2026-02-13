const mongoose = require("mongoose");
const User = require("../models/user");
const db = require("./setupTestDB");  

describe("Maintenance Tracker Testing", () => {

  beforeAll(async () => {
    await db.connect();
  });

  beforeEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  test("Maintenance status should be Pending by default for resident", async () => {
    const resident = await User.create({
      name: "Test Resident",
      email: "resident@test.com",
      password: "12345",
      role: "resident"
    });

    expect(resident.maintenanceStatus).toBe("Pending");
  });

  test("Admin should be able to mark maintenance as Paid", async () => {
    const resident = await User.create({
      name: "Resident A",
      email: "residentA@test.com",
      password: "12345",
      role: "resident"
    });

    resident.maintenanceStatus = "Paid";
    resident.maintenancePaymentDate = new Date();
    await resident.save();

    const updated = await User.findById(resident._id);
    expect(updated.maintenanceStatus).toBe("Paid");
    expect(updated.maintenancePaymentDate).toBeDefined();
  });

  test("Admin should be able to change maintenance from Paid back to Pending", async () => {
    const resident = await User.create({
      name: "Resident B",
      email: "residentB@test.com",
      password: "12345",
      role: "resident",
      maintenanceStatus: "Paid"
    });

    resident.maintenanceStatus = "Pending";
    resident.maintenancePaymentDate = null;
    await resident.save();

    const updated = await User.findById(resident._id);
    expect(updated.maintenanceStatus).toBe("Pending");
    expect(updated.maintenancePaymentDate).toBeNull();
  });
});