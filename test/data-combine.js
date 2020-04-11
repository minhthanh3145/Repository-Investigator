const RepositoryDataGenerator = require("../src/backend/RepositoryDataGenerator")
  .RepositoryDataGenerator;

const ClocDataAppender = require("../src/backend/ClocDataAppender")
  .ClocDataAppender;
// var appRoot = require("app-root-path");

describe("Generate complexity data", function() {
  it("with optimized v1 cloc data appender", async function() {
    this.timeout(0);
    const clocDataAppender = new ClocDataAppender();
    clocDataAppender.setFilterFunction(value => value[0].endsWith(".java"));
    const generator = new RepositoryDataGenerator(clocDataAppender);
    console.time("Integration test performance v1");
    const data = await generator.generateComplexityData({
      repository_path:
        "/Users/thanhto/Documents/repository/work/katalon-recorder",
      after_date: "2019-01-01"
    });
    console.timeEnd("Integration test performance v1");
  });
});
