const Constants = {
  EXTRACT_GIT_CMD(path, after_date) {
    return `git -C ${path} log --all --numstat --date=short --pretty=format:--%h--%ad--%aN --no-renames --after=${after_date}`;
  },
  EXTRACT_CODE_MAAT_CMD(pathToLogFile) {
    return `java -jar resources/code-maat.jar -l ${pathToLogFile} -c git2`;
  },
  EXTRACT_LINE_OF_CODES_CMD(filePath) {
    return `cloc ${filePath} --by-file --json --quiet`;
  },
  EXTRACT_LINE_OF_CODES_CMD_v2(repositoryPath) {
    return `cloc ${repositoryPath} --by-file --hide-rate --json --quiet`;
  }
};
module.exports.Constants = Constants;
