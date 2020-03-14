const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const fs = require("fs");
const RepositoryDataGenerator = require("./src/backend/RepositoryDataGenerator")
  .RepositoryDataGenerator;
app.use(cors());

const generator = new RepositoryDataGenerator();
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

app.get("/fetch_repository_data", async (req, res) => {
  const dataQuery = {
    repository_path: req.query.repository_path,
    after_date: req.query.after_date
  };
  console.log(dataQuery);
  const data = await generator.generateComplexityData(
    dataQuery,
    value => value[0].startsWith("source") && value[0].endsWith(".java")
  );
  const response = data;
  console.log("flare resource requested !");
  if (data) {
    res.json(response);
  } else {
    res.json({});
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
