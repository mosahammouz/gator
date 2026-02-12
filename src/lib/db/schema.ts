import {  pgTable, serial, text, integer, timestamp,unique ,uniqueIndex} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
});

export const feeds = pgTable("feeds", {
  id:  serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
    name: text("name"),
    url: text("url").notNull().unique(),
    user_id: integer("user_id").notNull().references(() => users.id, {
      onDelete: "cascade",
    })
  
});

export const feedFollows = pgTable(
  "feed_follows",
  {
    id: serial("id").primaryKey(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
    user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    feed_id: integer("feed_id").notNull().references(() => feeds.id, { onDelete: "cascade" }),
  },
  (table) => ({
    uniqueUserFeed: uniqueIndex("unique_user_feed").on(table.user_id, table.feed_id),
  })
  
);
