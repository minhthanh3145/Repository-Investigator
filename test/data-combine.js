const DataGenerator = require("../src/backend/DataGenerator").DataGenerator;
var appRoot = require("app-root-path");

describe("Generate complexity data", function() {
  it("should combine data correctly", async function() {
    this.timeout(0);
    const generator = new DataGenerator();
    const complexityData = await generator.generateComplexityData(
      {
        repository_path: appRoot,
        after_date: "2019-01-01"
      },
      value => !value[0].startsWith("node_modules")
    );
    console.log(complexityData);
  });
});
