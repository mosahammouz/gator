import fs from "fs";
import os from "os";
import path from "path";

export type Config = {   // ts uses camelCase
  dbUrl: string;
  currentUserName?: string; 
}

//// helpers ////

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  const filePath = getConfigFilePath();

  const rawConfig = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };

  fs.writeFileSync(filePath, JSON.stringify(rawConfig, null, 2));
}

function validateConfig(rawConfig: any): Config {
  if (!rawConfig.db_url) {
    throw new Error("Invalid config file: missing db_url");
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}

///////// helpers /////



/////////// Exported functions/////////

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  const fileContents = fs.readFileSync(filePath, "utf-8");

  const parsed = JSON.parse(fileContents); // convert from json to js obj
  return validateConfig(parsed);
}

export function setUser(userName: string): void {
  const config = readConfig();
  config.currentUserName = userName;
  writeConfig(config);
}

export function getUser(): string | undefined {
  const config = readConfig();
  return config.currentUserName;
}


//////////// Exported functions////////////

























