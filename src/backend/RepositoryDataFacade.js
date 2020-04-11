const RepositoryDataGenerator = require("./RepositoryDataGenerator")
  .RepositoryDataGenerator;
const ClocDataAppender = require("./ClocDataAppender").ClocDataAppender;

class RepositoryDataFacade {
  constructor() {}
  async generateRepositoryData(dataQuery) {
    const clocDataAppender = new ClocDataAppender();
    const extensions = dataQuery.extensions.split(",");
    const filterFunction =
      dataQuery.extensions != ""
        ? (value) => extensions.some((ext) => value[0].endsWith("." + ext))
        : (_) => true;
    clocDataAppender.setFilterFunction(filterFunction);
    const generator = new RepositoryDataGenerator(clocDataAppender);
    const data = await generator.generateComplexityData(dataQuery);
    return data;
  }
}

module.exports.RepositoryDataFacade = RepositoryDataFacade;
