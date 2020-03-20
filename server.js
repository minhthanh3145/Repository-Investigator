const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const fs = require("fs");
const RepositoryDataGenerator = require("./src/backend/RepositoryDataGenerator")
  .RepositoryDataGenerator;
const ClocDataAppender = require("./src/backend/ClocDataAppender")
  .ClocDataAppender;
const LegacyClocDataAppender = require("./src/backend/LegacyClocDataAppender")
  .LegacyClocDataAppender;
app.use(cors());

app.get("/flare", (req, res) => {
  const data = fs.readFileSync("test/fixtures/d3/flare.json", "utf8");
  const response = JSON.parse(data);
  console.log("Repository resource requested !");
  if (data) {
    res.json(response);
  } else {
    res.json({});
  }
});

app.get("/fetch_repository_data_legacy", async (req, res) => {
  const dataQuery = {
    repository_path: req.query.repository_path,
    after_date: req.query.after_date
  };
  console.time("Requested data with legacy mechanism");
  const clocDataAppender = new LegacyClocDataAppender();
  clocDataAppender.setFilterFunction(value => value[0].endsWith(".js"));
  const generator = new RepositoryDataGenerator(clocDataAppender);
  const data = await generator.generateComplexityData(dataQuery);
  console.timeEnd("Requested data with legacy mechanism");
  if (data) {
    res.json(data);
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
  console.time("Requested data with optimized mechanism");
  const clocDataAppender = new ClocDataAppender();
  clocDataAppender.setFilterFunction(value => value[0].endsWith(".js"));
  const generator = new RepositoryDataGenerator(clocDataAppender);
  const data = await generator.generateComplexityData(dataQuery);
  console.timeEnd("Requested data with optimized mechanism");
  if (data) {
    res.json(data);
  } else {
    res.json({});
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
