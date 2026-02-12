import{setUser, getUser} from "./config.js";
import { createUser, getUserByName , resetUsers , getUsers , createFeed, printFeed, Feed, User , feedHandler,  createFeedFollow, getFeedByUrl,  getFeedFollowsForUser , deleteAFeedFollowByUser  } from "./lib/db/queries/users";
import fetch from "node-fetch";

import { fetchFeed } from "./rss";
export type CommandHandler = (cmdName: string, ...args: string[])=>Promise<void>;
export type UserCommandHandler = (cmdName: string, user: User, ...args: string[])=> Promise<void>;

export const middlewareLoggedIn = (handler: UserCommandHandler): CommandHandler => {
  return async (cmdName: string, ...args: string[]) => {
    const currentUserName = getUser(); //for logged in user
    if (!currentUserName) {
      console.error("No user is currently logged in. Use login command first.");
      process.exit(1);
    }

    const user = await getUserByName(currentUserName);
    if (!user) {
      console.error(`User "${currentUserName}" not found.`);
      process.exit(1);
    }

    await handler(cmdName, user, ...args);
  };
};



export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error("Username is required");
    process.exit(1);
  }

  const username: string = args[0];

  const user = await getUserByName(username);
  if (!user) {
    console.error(`User "${username}" does not exist`);
    process.exit(1);
  }

  setUser(username);
  console.log(`Logged in as ${username}`);
}

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
registry[cmdName]=handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
const handler = registry[cmdName];
if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }
  await handler(cmdName, ...args);
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error("Username is required");
    process.exit(1);
  }

  const username: string = args[0];

  // Check if user already exists
  const existingUser = await getUserByName(username);
  if (existingUser) {
    console.error("User already exists");
    process.exit(1);
  }

  // Create new user
  const newUser = await createUser(username);

  // Set current user in config
  setUser(username);

  console.log(`User created successfully as ${username}`);
  console.log(newUser); // optional for debugging
}


export async function resetCommand(): Promise<void> {
const ok = await resetUsers();
    if(ok){ console.log(" Database reset successfully.");  process.exit(0);}
           
    else{console.error("Failed to reset database."); process.exit(1);}
}

export async function usersCommand(cmdName: string, ...args: string[]): Promise<void> {
  const arrOfUsers = await getUsers();
  const currentUser = getUser();

  for (const user of arrOfUsers) {
    if (user.name === currentUser) {
      console.log(`${user.name} (current)`);
    } else {
      console.log(user.name);
    }
  }
}


export async function aggCommand(
  _cmdName: string,
  ..._args: string[]
): Promise<void> {
  try {
    const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(feed, null, 2)); // should print full feed
  } catch (err: any) {
    console.error("Failed to fetch RSS feed:", err.message);
    process.exit(1);
  }
}


export async function addfeedCommand(cmdName: string, user: User, ...args: string[]) {
  if (args.length < 2) {
    console.error("Usage: addfeed <name> <url>");
    process.exit(1);
  }

  const [name, url] = args;

  // Check if feed already exists
  let feed = await getFeedByUrl(url);
  if (!feed) {
    feed = await createFeed(name, url, user.id);
    console.log("New feed created:");
  } else {
    console.log("Feed already exists:");
  }

  // Check if user already follows this feed
  const follows = await getFeedFollowsForUser(user.id);
  const alreadyFollowing = follows.some(f => f.feedId === feed.id);

  if (!alreadyFollowing) {
    await createFeedFollow(user.id, feed.id);
  }

  // Print feed info
  printFeed(feed, user);
  console.log(`${user.name} is now following "${feed.name}"`);
}





export async function feedsCommand() {
  const feeds: Feed[] = await feedHandler();

  if (feeds.length === 0) {
    console.log("no feeds !!");
    return;
  }

  for (const feed of feeds) {
    console.log(`Name: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
    console.log(`Created By: ${feed.userName}`);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function handlerFollow(cmdName: string, user: User, urlArg?: string) {
  const url = urlArg?.trim();
  if (!url) throw new Error("URL argument is required");

  const feed = await getFeedByUrl(url);
  if (!feed) throw new Error("Feed not found");

  await createFeedFollow(user.id, feed.id);
  console.log(`${user.name} is now following ${feed.name}`);
}



export async function followingCommand(cmdName: string, user: User) {
  const follows = await getFeedFollowsForUser(user.id);

  if (follows.length === 0) {
    console.log(`${user.name} is not following any feeds.`);
    return;
  }

  console.log(`${user.name} is following:`);
  for (const follow of follows) {
    console.log(`- ${follow.feedName}`);
  }
}

export async function unfollowCommand(cmdName: string, user: User, ...args: string[]) {
  const feedUrl = args[0]; // get feed URL from CLI args
  if (!feedUrl) {
    console.error("Usage: unfollow <feed-url>");
    process.exit(1);
  }

  await deleteAFeedFollowByUser(user, feedUrl);
}

