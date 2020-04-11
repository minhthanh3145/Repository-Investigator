const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const fs = require("fs");
const RepositoryDataFacade = require("./src/backend/RepositoryDataFacade")
  .RepositoryDataFacade;

const repositoryFacade = new RepositoryDataFacade();
app.use(cors());

app.get("/fetch_repository_data", async (req, res) => {
  const dataQuery = {
    repository_path: req.query.repository_path,
    after_date: req.query.after_date,
    extensions: req.query.extensions,
  };
  console.log(dataQuery);
  console.time("Requested data with optimized mechanism");
  const data = await repositoryFacade.generateRepositoryData(dataQuery);
  console.timeEnd("Requested data with optimized mechanism");
  if (data) {
    res.statusCode = 200;
    res.json(data);
  } else {
    res.statusCode = 400;
    res.json({});
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
