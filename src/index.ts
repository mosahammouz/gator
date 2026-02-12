import {setUser, readConfig} from "./config.js";
import {
  CommandsRegistry,
  registerCommand,
  runCommand,
  handlerLogin,
  handlerRegister,
  resetCommand,
  usersCommand,
  aggCommand,
  addfeedCommand,
  feedsCommand,
  handlerFollow,
  followingCommand,
   middlewareLoggedIn,
   unfollowCommand
} from "./commands.js";

async function main() {
  const registry: CommandsRegistry = {}; //record
  registerCommand(registry, "login", handlerLogin); // we connect it in the record
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset" , resetCommand);
  registerCommand(registry, "users" , usersCommand);
  registerCommand(registry, "agg" , aggCommand);
 registerCommand(registry, "addfeed", middlewareLoggedIn(addfeedCommand));
  registerCommand(registry, "feeds" , feedsCommand);
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(followingCommand));
   registerCommand(registry, "unfollow", middlewareLoggedIn(unfollowCommand));
  
  const args = process.argv.slice(2);// the #words that written by the the user (here in powershell)//arr
  if(args.length <1) { console.error("not enough arguments were provided."); process.exit(1);}
  const cmdName = args[0];
  const cmdArgs = args.slice(1); // from 1 to 2,3,,5...
  
  
  await runCommand(registry, cmdName , ...cmdArgs);
  
  process.exit(0);

}

main();

