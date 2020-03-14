const DataGenerator = require("../src/backend/DataGenerator").DataGenerator;
const fs = require("fs");
const expect = require("chai").expect;
const CSV = require("csv-string");

describe("Cloc test", function() {
  it("should count files and lines as expected", async function() {
    const expected = JSON.parse(
      fs.readFileSync(__dirname + "/fixtures/cloc/result.txt", "utf8")
    );

    const generator = new DataGenerator();
    const cmd = generator.countNumberOfLinesCmd(
      __dirname + "/fixtures/cloc/loc.js"
    );

    const actual = JSON.parse(await generator.executeCommand(cmd));
    expect(actual["SUM"]["code"]).to.not.be.equal(0);
    expect(actual["SUM"]["code"]).to.be.equal(expected["SUM"]["code"]);
  });
});

describe("Code Maat test", function() {
  it("should parse logfile into no.authors and no.revisions as expected ", async function() {
    this.timeout(10000);
    const expected = CSV.parse(
      fs.readFileSync(__dirname + "/fixtures/code-maat/result.txt", "utf8")
    );

    const generator = new DataGenerator();
    const cmd = generator.runCodeMaatOnExtractedGitLogCmd(
      "test/fixtures/code-maat/logfile.log"
    );
    const actual = CSV.parse(await generator.executeCommand(cmd));
    expect(actual.length).to.be.equal(expected.length);
    for (let i = 0; i < actual.length; i++) {
      expect(actual[i][0]).to.be.equal(expected[i][0]);
      expect(actual[i][1]).to.be.equal(expected[i][1]);
      expect(actual[i][2]).to.be.equal(expected[i][2]);
    }
  });
});
