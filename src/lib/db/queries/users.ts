import { db } from "../index";
import { users , feeds, feedFollows} from "../schema"; // tables
import { eq } from "drizzle-orm";
export type User = typeof users.$inferSelect;



export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string) {
  const [user] = await db.select().from(users).where(eq(users.name, name));
  return user;
}

export async function resetUsers(): Promise<boolean> {
  try {
    await db.delete(users).execute(); 
    return true;
  } catch (error) {
    console.error("Error resetting users:", error);
    return false;
  }
}

export async function getUsers(){
return await db.select().from(users).execute();
}

export async function createFeed(name: string, url: string, user_id: number) {
  const [existingFeed] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));

  if (existingFeed) return existingFeed;

  const [feed] = await db
    .insert(feeds)
    .values({ name, url, user_id })
    .returning();

  return feed;
}

export type Feed = typeof feeds.$inferSelect;
export type FeedFollow = typeof feedFollows.$inferSelect;


export function printFeed(feed: Feed, user: User) {
  console.log(" New feed created:");
  console.log(`Feed ID: ${feed.id}`);
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`Created At: ${feed.created_at}`);
  console.log(`Updated At: ${feed.updated_at}`);
  console.log(`User: ${user.name} (ID: ${user.id})`);
}



export async function feedHandler(): Promise<Feed[]> {
  const result = await db
    .select({
      name: feeds.name,
      url: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .leftJoin(users, eq(users.id, feeds.user_id));

  return result;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function createFeedFollow(user_id: number, feed_id: number) {
  // Insert new follow
  const [newFollow] = await db
    .insert(feedFollows)
    .values({ user_id, feed_id })
    .returning();

  // Query to include user and feed names
  const [result] = await db
    .select({
      id: feedFollows.id,
      created_at: feedFollows.created_at,
      updated_at: feedFollows.updated_at,
      user_id: feedFollows.user_id,
      feed_id: feedFollows.feed_id,
      user_name: users.name,
      feed_name: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.user_id, users.id))
    .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id))
    .where(eq(feedFollows.id, newFollow.id));

  return result;
}

export async function getFeedByUrl(url: string) {
  const [feed] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));

  return feed;
}


export type FeedFollowResult = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  feedName: string;
  userName: string;
};

export async function getFeedFollowsForUser(userId: number) {
  const follows = await db
    .select({
      followId: feedFollows.id,
      createdAt: feedFollows.created_at,
      updatedAt: feedFollows.updated_at,
      feedId: feedFollows.feed_id,
      feedName: feeds.name,
      feedUrl: feeds.url,
      userName: users.name,
      userId: users.id,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id)) // ✅ use eq() here
    .innerJoin(users, eq(feedFollows.user_id, users.id)) // ✅ use eq() here
    .where(eq(feedFollows.user_id, userId));

  return follows;
}


export async function deleteAFeedFollowByUser(user: User, feedUrl){

const [feed] = await db.select().from(feeds).where(eq(feeds.url, feedUrl));
  if (!feed) {
    console.log(`Feed with URL "${feedUrl}" not found`);
    return;
  }
 const res = await db.delete(feedFollows).where(eq(feedFollows.user_id , user.id)).where(eq(feedFollows.feed_id, feed.id)).returning();
  if (res.length === 0) {
    console.log(`${user.name} was not following "${feed.name}"`);
  } else {
    console.log(`${user.name} has unfollowed "${feed.name}"`);
  }

}

