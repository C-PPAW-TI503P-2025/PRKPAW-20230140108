const express = require("express");

const cors = require("cors");

const app = express();
const port = 3001;


app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Hello from Node.js Server!" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// prkpaw-20230140108 nama repository