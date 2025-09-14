import type { Kysely } from "kysely"
import { sql } from "kysely"
import type { DBSchema } from "../../../sql/kysely-adapter"

export async function up(db: Kysely<DBSchema>): Promise<void> {
    // Ensure required extension for UUID generation
    await sql`create extension if not exists "pgcrypto"`.execute(db)

    await db.schema
        .createTable("Post")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("authorId", "text")
        .addColumn("defaultLocale", "text", (col) => col.notNull().defaultTo("en"))
        .addColumn("title", "text", (col) => col.notNull())
        .addColumn("slug", "text", (col) => col.notNull().unique())
        .addColumn("excerpt", "text", (col) => col.notNull())
        .addColumn("content", "text", (col) => col.notNull())
        .addColumn("image", "text")
        .addColumn("version", "integer", (col) => col.notNull().defaultTo(1))
        .addColumn("status", "text", (col) => col.notNull().defaultTo("DRAFT"))
        .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updatedAt", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .execute()

    await db.schema
        .createIndex("post_author_id_idx")
        .on("Post")
        .column("authorId")
        .execute()

    await db.schema
        .createIndex("post_status_updated_at_idx")
        .on("Post")
        .columns(["status", "updatedAt"])
        .execute()

    await db.schema
        .createTable("Tag")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("defaultLocale", "text", (col) => col.notNull().defaultTo("en"))
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("slug", "text", (col) => col.notNull().unique())
        .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updatedAt", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .execute()

    await db.schema
        .createTable("PostI18n")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("postId", "uuid", (col) => col.notNull().references("Post.id").onDelete("cascade"))
        .addColumn("locale", "text", (col) => col.notNull())
        .addColumn("title", "text", (col) => col.notNull())
        .addColumn("slug", "text", (col) => col.notNull())
        .addColumn("excerpt", "text", (col) => col.notNull())
        .addColumn("content", "text", (col) => col.notNull())
        .execute()

    await db.schema
        .createIndex("post_i18n_locale_idx")
        .on("PostI18n")
        .column("locale")
        .execute()

    await db.schema
        .createIndex("post_i18n_post_id_locale_unique")
        .on("PostI18n")
        .columns(["postId", "locale"])
        .unique()
        .execute()

    await db.schema
        .createIndex("post_i18n_locale_slug_unique")
        .on("PostI18n")
        .columns(["locale", "slug"])
        .unique()
        .execute()

    await db.schema
        .createTable("TagI18n")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("tagId", "uuid", (col) => col.notNull().references("Tag.id").onDelete("cascade"))
        .addColumn("locale", "text", (col) => col.notNull())
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("slug", "text", (col) => col.notNull())
        .execute()

    await db.schema
        .createIndex("tag_i18n_locale_idx")
        .on("TagI18n")
        .column("locale")
        .execute()

    await db.schema
        .createIndex("tag_i18n_tag_id_locale_unique")
        .on("TagI18n")
        .columns(["tagId", "locale"])
        .unique()
        .execute()

    await db.schema
        .createIndex("tag_i18n_locale_slug_unique")
        .on("TagI18n")
        .columns(["locale", "slug"])
        .unique()
        .execute()

    await db.schema
        .createTable("PostTag")
        .addColumn("postId", "uuid", (col) => col.notNull().references("Post.id").onDelete("cascade"))
        .addColumn("tagId", "uuid", (col) => col.notNull().references("Tag.id").onDelete("cascade"))
        .addPrimaryKeyConstraint("pk_post_tag", ["postId", "tagId"])
        .execute()

    await db.schema
        .createIndex("post_tag_tag_id_idx")
        .on("PostTag")
        .column("tagId")
        .execute()
}

export async function down(db: Kysely<DBSchema>): Promise<void> {
    await db.schema.dropTable("PostTag").execute()
    await db.schema.dropTable("TagI18n").execute()
    await db.schema.dropTable("PostI18n").execute()
    await db.schema.dropTable("Tag").execute()
    await db.schema.dropTable("Post").execute()
}


