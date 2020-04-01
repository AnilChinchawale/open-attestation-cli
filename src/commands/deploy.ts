import { Argv } from "yargs";

export const command = "deploy <contract-type>";

export const describe = "Deploys a smart contract on the blockchain";

export const builder = (yargs: Argv): Argv => yargs.commandDir("deploy", { extensions: ["ts"] });

export const handler = (): void => {};

export default {
  command,
  describe,
  builder,
  handler
};
