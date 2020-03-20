const CommandUtil = require("./CommandUtil").CommandUtil;
const Constants = require("./Constants").Constants;
const HierarchicalDataBuilder = require("./HierarchicalDataBuilder")
  .HierarchicalDataBuilder;

class LegacyClocDataAppender {
  _excludedExtensions = [".svg", ".png", ".jpg", ".md"];

  _filterFunction = value =>
    !_excludedExtensions.filter(ext => {
      return value[0].endsWith(ext);
    }).length;

  _hierarchicalDataBuilder = new HierarchicalDataBuilder();

  constructor() {}

  doExtractLineOfCode(path) {
    return CommandUtil.executeCommand(
      Constants.EXTRACT_LINE_OF_CODES_CMD(path)
    );
  }

  setFilterFunction(filterFunc) {
    this._filterFunction = filterFunc;
  }

  async generateHierarchicalData(codeMaatOutput, repository_path) {
    let output = {
      name: "hierarchy",
      children: []
    };
    let complexityData = [];
    for (const value of codeMaatOutput) {
      let clocOutput;
      let jsonLineOfCodeExtracted;
      if (this._filterFunction(value)) {
        try {
          jsonLineOfCodeExtracted = await this.doExtractLineOfCode(
            repository_path + "/" + value[0]
          );
          clocOutput = JSON.parse(jsonLineOfCodeExtracted);
        } catch (e) {
          // Do nothing here
        }
        const lineOfCode =
          clocOutput && clocOutput["SUM"] && clocOutput["SUM"]["code"];
        if (lineOfCode) {
          value.push(lineOfCode);
          complexityData.push(value);
          this._hierarchicalDataBuilder._generateHierarchicalData(
            output,
            value[0],
            {
              "n-authors": value[1],
              "n-revisions": value[2],
              loc: value[3]
            }
          );
        }
      }
    }
    return output;
  }
}

module.exports.LegacyClocDataAppender = LegacyClocDataAppender;
