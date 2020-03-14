const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const fs = require("fs");

app.use(cors());

app.get("/flare", (req, res) => {
  const data = fs.readFileSync("test/fixtures/d3/flare.json", "utf8");
  const response = JSON.parse(data);
  console.log("flare resource requested !");
  if (data) {
    res.json(response);
  } else {
    res.json({});
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
