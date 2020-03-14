const RepositoryDataGenerator = require("../src/backend/RepositoryDataGenerator")
  .RepositoryDataGenerator;
// var appRoot = require("app-root-path");

describe("Generate complexity data", function() {
  it("should combine data correctly", async function() {
    this.timeout(0);
    const generator = new RepositoryDataGenerator();
    const complexityData = await generator.generateComplexityData(
      {
        repository_path:
          "/Users/thanhto/Documents/repository/work/katalon-recorder",
        after_date: "2019-01-01"
      },
      value => value[0].endsWith(".js")
    );
  });
});
