// backend/index.js (Express setup)
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3001;
app.use(cors()); // Enable CORS
// Parse JSON body
app.use(express.json());

// Read mockdb.json
const mockdbPath = path.join(__dirname, "mockdb.json");

// GET all records
app.get("/data", (req, res) => {
  fs.readFile(mockdbPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading database:", err);
      return res.status(500).send("Error reading database");
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      res.status(500).send("Invalid JSON format in mockdb.json");
    }
  });
});

// POST new record to mockdb.json
app.post("/data", (req, res) => {
    const newEntry = req.body;
    console.log("new entry", newEntry);
    console.log("Mock DB Path:", mockdbPath);

    fs.readFile(mockdbPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading database");
    }
    const mockdb = JSON.parse(data);
    mockdb.push(newEntry); // Add new entry
    fs.writeFile(mockdbPath, JSON.stringify(mockdb, null, 2), (err) => {
      if (err) {
        return res.status(500).send("Error writing to database");
      }
      res.status(200).send("Entry added successfully");
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
