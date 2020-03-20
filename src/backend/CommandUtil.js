class CommandUtil {
  /**
   *
   * @param {String} command The command will be splited by space and trim.
   * The first element will be used as the target program and the rest will be the arguments
   */
  static async executeCommand(command) {
    const spawn = require("child_process").spawnSync;
    const splitted = command.split(" ").map(item => item.trim());
    const program = splitted[0];
    splitted.shift();
    return spawn(program, splitted, {
      maxBuffer: 1000 * 1000 * 10 // 10 MB
    }).stdout.toString();
  }
}

module.exports.CommandUtil = CommandUtil;
