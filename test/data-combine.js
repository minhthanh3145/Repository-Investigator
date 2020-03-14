const DataGenerator = require("../src/backend/DataGenerator").DataGenerator;

describe("Generate complexity data", function() {
  it("should combine data correctly", async function() {
    this.timeout(0);
    const generator = new DataGenerator();
    const complexityData = await generator.generateComplexityData({
      repository_path:
        "/Users/thanhto/Documents/repository/others/katalon-notes",
      after_date: "2019-01-01"
    });
    console.log(complexityData);
  });
});
