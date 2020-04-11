const CommandUtil = require("./CommandUtil").CommandUtil;
const Constants = require("./Constants").Constants;
const HierarchicalDataBuilder = require("./HierarchicalDataBuilder")
  .HierarchicalDataBuilder;

class ClocDataAppender {
  _excludedExtensions = [".svg", ".png", ".jpg", ".md"];
  _filterFunction = (value) =>
    !_excludedExtensions.filter((ext) => {
      return value[0].endsWith(ext);
    }).length;

  _hierarchicalDataBuilder = new HierarchicalDataBuilder();

  constructor() {}

  doExtractLineOfCode(path) {
    return CommandUtil.executeCommand(
      Constants.EXTRACT_LINE_OF_CODES_CMD_v2(path)
    );
  }

  setFilterFunction(filterFunc) {
    this._filterFunction = filterFunc;
  }

  async generateHierarchicalData(codeMaatOutput, repository_path) {
    const rawData = await this.doExtractLineOfCode(repository_path);
    const clocDataMap = JSON.parse(rawData);
    let output = {
      name: repository_path,
      children: [],
    };
    for (const value of codeMaatOutput) {
      if (this._filterFunction(value)) {
        const key = repository_path + "/" + value[0];
        const entryInClocDataMap = clocDataMap[key];
        if (entryInClocDataMap) {
          value.push(entryInClocDataMap["code"]);
          this._hierarchicalDataBuilder._generateHierarchicalData(
            output,
            value[0],
            {
              "n-authors": value[1],
              "n-revisions": value[2],
              loc: value[3],
            }
          );
        }
      }
    }
    return output;
  }
}

module.exports.ClocDataAppender = ClocDataAppender;
