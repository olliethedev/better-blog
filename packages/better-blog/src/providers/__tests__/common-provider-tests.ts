import { getTestPosts } from "@/lib/data"
import type { BlogDataProvider, Post } from "@/types"
import { slugify } from "../../lib/format-utils"
import type {
    PostCreateExtendedInput,
    PostUpdateExtendedInput,
    TagConnectOrCreate
} from "../../schema/post"

export function commonProviderTests(
    createProvider: () => BlogDataProvider | Promise<BlogDataProvider>
): void {
    describe("Common BlogDataProvider tests", () => {
        let provider: Required<BlogDataProvider>
        let testPosts: Post[] = []

        beforeAll(async () => {
            provider = (await createProvider()) as Required<BlogDataProvider>

            testPosts = getTestPosts()
        })

        it("should add a post", async () => {
            const testPost = testPosts[0]
            const newPost = await provider.createPost({
                ...testPost,
                tags: [tagStringToTagCreate(testPost.tags[0].name)]
            } satisfies PostCreateExtendedInput)
            comparePostShapes(testPost, newPost)
        })

        it("should get first post", async () => {
            const posts = await provider.getAllPosts()
            expect(posts).toBeDefined()
            expect(posts.length).toBe(1)

            //first post shape
            const testPost = testPosts[0]
            const post = await provider.getPostBySlug(testPost.slug)
            expect(post).toBeDefined()
            if (!post) return
            comparePostShapes(testPost, post)
        })

        it("should add second post with string tag", async () => {
            const testPost = testPosts[1]
            const newPost = await provider.createPost({
                ...testPost,
                tags: [testPost.tags[0].name]
            } satisfies PostCreateExtendedInput)
            comparePostShapes(testPost, newPost)
        })

        it("should add remaining posts", async () => {
            for (let i = 2; i < testPosts.length; i++) {
                const testPost = testPosts[i]
                const tags =
                    i % 2 === 0
                        ? [testPost.tags[0].name]
                        : [tagStringToTagCreate(testPost.tags[0].name)]
                const newPost = await provider.createPost({
                    ...testPost,
                    tags
                } satisfies PostCreateExtendedInput)
                comparePostShapes(testPost, newPost)
            }
        })

        it("should list all posts in date-desc order", async () => {
            const posts = await provider.getAllPosts()
            expect(posts).toBeDefined()
            expect(posts.length).toBe(testPosts.length)

            const expectedOrder = testPosts
                .slice()
                .sort((a, b) => {
                    const aDate = a.publishedAt ?? a.createdAt
                    const bDate = b.publishedAt ?? b.createdAt
                    return bDate.getTime() - aDate.getTime()
                })
                .map((p) => p.slug)

            expect(posts.map((p) => p.slug)).toEqual(expectedOrder)
        })

        it("should filter by slug", async () => {
            const target = testPosts[7]
            const posts = await provider.getAllPosts({ slug: target.slug })
            expect(posts.length).toBe(1)
            expect(posts[0]?.slug).toBe(target.slug)
        })

        it("should filter by tag (name, slug, and case-insensitive)", async () => {
            const target = testPosts[3]
            const tagName = target.tags[0].name
            const tagSlug = target.tags[0].slug

            const byName = await provider.getAllPosts({ tag: tagName })
            expect(byName.length).toBe(1)
            expect(byName[0]?.slug).toBe(target.slug)

            const bySlug = await provider.getAllPosts({ tag: tagSlug })
            expect(bySlug.length).toBe(1)
            expect(bySlug[0]?.slug).toBe(target.slug)

            const byNameCase = await provider.getAllPosts({
                tag: tagName.toUpperCase()
            })
            expect(byNameCase.length).toBe(1)
            expect(byNameCase[0]?.slug).toBe(target.slug)
        })

        it("should filter by query across title/excerpt/content (case-insensitive)", async () => {
            const markdownQuery = await provider.getAllPosts({
                query: "markdown"
            })
            expect(markdownQuery.length).toBe(1)
            expect(markdownQuery[0]?.slug).toBe(testPosts[0].slug)

            const sampleAll = await provider.getAllPosts({ query: "sample" })
            expect(sampleAll.length).toBe(14)

            const react = await provider.getAllPosts({ query: "react" })
            expect(react.length).toBe(1)
            expect(react[0]?.slug).toBe(testPosts[1].slug)
        })

        it("should filter by published flag", async () => {
            const published = await provider.getAllPosts({ published: true })
            const drafts = await provider.getAllPosts({ published: false })

            expect(published.length).toBe(12)
            expect(drafts.length).toBe(3)

            const draftPost = testPosts[4]
            const none = await provider.getAllPosts({
                tag: draftPost.tags[0].name,
                published: true
            })
            expect(none.length).toBe(0)
        })

        it("should support pagination with limit and offset", async () => {
            const expectedOrder = testPosts
                .slice()
                .sort((a, b) => {
                    const aDate = a.publishedAt ?? a.createdAt
                    const bDate = b.publishedAt ?? b.createdAt
                    return bDate.getTime() - aDate.getTime()
                })
                .map((p) => p.slug)

            const firstFive = await provider.getAllPosts({ limit: 5 })
            expect(firstFive.length).toBe(5)
            expect(firstFive.map((p) => p.slug)).toEqual(
                expectedOrder.slice(0, 5)
            )

            const nextFive = await provider.getAllPosts({ offset: 5, limit: 5 })
            expect(nextFive.length).toBe(5)
            expect(nextFive.map((p) => p.slug)).toEqual(
                expectedOrder.slice(5, 10)
            )

            const beyond = await provider.getAllPosts({
                offset: 100,
                limit: 10
            })
            expect(beyond.length).toBe(0)
        })

        it("should paginate within filtered (published) results", async () => {
            const publishedOrdered = testPosts
                .filter((p) => p.published)
                .sort((a, b) => {
                    const aDate = a.publishedAt ?? a.createdAt
                    const bDate = b.publishedAt ?? b.createdAt
                    return bDate.getTime() - aDate.getTime()
                })
                .map((p) => p.slug)

            const topThree = await provider.getAllPosts({
                published: true,
                limit: 3
            })
            expect(topThree.length).toBe(3)
            expect(topThree.map((p) => p.slug)).toEqual(
                publishedOrdered.slice(0, 3)
            )

            const nextTwo = await provider.getAllPosts({
                published: true,
                offset: 3,
                limit: 2
            })
            expect(nextTwo.length).toBe(2)
            expect(nextTwo.map((p) => p.slug)).toEqual(
                publishedOrdered.slice(3, 5)
            )
        })

        it("should combine slug with published filter correctly", async () => {
            const draftPost = testPosts[14]

            const none = await provider.getAllPosts({
                slug: draftPost.slug,
                published: true
            })
            expect(none.length).toBe(0)

            const one = await provider.getAllPosts({
                slug: draftPost.slug,
                published: false
            })
            expect(one.length).toBe(1)
            expect(one[0]?.slug).toBe(draftPost.slug)
        })

        it("should update an existing post's tags and validate tag counts", async () => {
            // Choose a post that is not tagged with React initially
            const target = testPosts[2] // e.g., CSS
            const existingTagToAdd = testPosts[1].tags[0].name // "React"
            const newTagToAdd = "NewTopic"

            // Baseline counts
            const beforeExistingTagCount = (
                await provider.getAllPosts({ tag: existingTagToAdd })
            ).length
            expect(beforeExistingTagCount).toBe(1)

            const beforeNewTagCount = (
                await provider.getAllPosts({ tag: newTagToAdd })
            ).length
            expect(beforeNewTagCount).toBe(0)

            // Perform update: keep original tag, add existing (React) and brand new tag
            const updated = await provider.updatePost(target.slug, {
                title: target.title,
                content: target.content,
                excerpt: target.excerpt,
                slug: target.slug,
                tags: {
                    create: [
                        tagStringToTagCreate(target.tags[0].name),
                        tagStringToTagCreate(existingTagToAdd),
                        tagStringToTagCreate(newTagToAdd)
                    ]
                }
            } satisfies PostUpdateExtendedInput)

            expect(updated).toBeDefined()
            expect(updated.tags.map((t) => t.name)).toEqual(
                expect.arrayContaining([
                    target.tags[0].name,
                    existingTagToAdd,
                    newTagToAdd
                ])
            )

            // Tag counts should reflect the update
            const afterExistingTagCount = (
                await provider.getAllPosts({ tag: existingTagToAdd })
            ).length
            expect(afterExistingTagCount).toBe(beforeExistingTagCount + 1)

            const afterNewTagCount = (
                await provider.getAllPosts({ tag: newTagToAdd })
            ).length
            expect(afterNewTagCount).toBe(beforeNewTagCount + 1)
        })

        it("should delete a post by slug and make it unavailable", async () => {
            const target = testPosts[5]
            // ensure it exists
            const before = await provider.getPostBySlug(target.slug)
            expect(before).toBeTruthy()

            await provider.deletePost?.(target.slug)

            const after = await provider.getPostBySlug(target.slug)
            expect(after).toBeNull()

            const all = await provider.getAllPosts()
            expect(all.find((p) => p.slug === target.slug)).toBeUndefined()
        })

        it("should be idempotent when deleting a non-existent post", async () => {
            // delete same slug again should not throw
            const target = testPosts[5]
            await expect(
                provider.deletePost?.(target.slug)
            ).resolves.toBeUndefined()
        })

        it("should apply defaults for slug, id, and excerpt on create", async () => {
            const title = "Defaults Title"
            const content = "Defaults content"
            const published = false
            const excerpt = ""

            const created = await provider.createPost({
                title,
                content,
                published,
                excerpt
            } satisfies PostCreateExtendedInput)

            expect(created).toBeDefined()
            expect(created.slug).toBe(slugify(title))
            expect(typeof created.id).toBe("string")
            expect(created.id.length).toBeGreaterThan(0)
            expect(created.excerpt).toBe("")
        })

        it("should return an empty array when limit is 0", async () => {
            const page = await provider.getAllPosts({ limit: 0 })
            expect(page).toEqual([])
        })

        it("should ignore whitespace-only query in filtering", async () => {
            const all = await provider.getAllPosts()
            const white = await provider.getAllPosts({ query: "   " })
            expect(white.length).toBe(all.length)
            expect(white.map((p) => p.slug)).toEqual(all.map((p) => p.slug))
        })

        it("should return same post by slug regardless of locale option", async () => {
            const target = testPosts[0]
            const base = await provider.getPostBySlug(target.slug)
            const withLocale = await provider.getPostBySlug(target.slug, {
                locale: "x"
            })
            expect(withLocale).toEqual(base)
        })

        it("should return null for an unknown slug", async () => {
            const none = await provider.getPostBySlug("unknown-slug")
            expect(none).toBeNull()
        })

        it("should update a post's slug and move the lookup key", async () => {
            const target = testPosts[6]
            const oldSlug = target.slug
            const newSlug = `${target.slug}-updated`

            const updated = await provider.updatePost(oldSlug, {
                title: target.title,
                content: target.content,
                excerpt: target.excerpt,
                slug: newSlug
            } satisfies PostUpdateExtendedInput)

            expect(updated.slug).toBe(newSlug)

            const byOld = await provider.getPostBySlug(oldSlug)
            expect(byOld).toBeNull()

            const byNew = await provider.getPostBySlug(newSlug)
            expect(byNew).not.toBeNull()
            expect(byNew?.slug).toBe(newSlug)

            const all = await provider.getAllPosts()
            expect(all.find((p) => p.slug === oldSlug)).toBeUndefined()
            expect(all.find((p) => p.slug === newSlug)).toBeDefined()
        })

        it("should throw when updating a non-existent slug", async () => {
            await expect(
                provider.updatePost("does-not-exist", {
                    title: "T",
                    content: "C",
                    excerpt: "",
                    slug: "new-slug"
                } satisfies PostUpdateExtendedInput)
            ).rejects.toThrow("Post not found")
        })

        it("should persist only author id; name/image resolved via getAuthor()", async () => {
            const authorId = "author-xyz"

            const created = await provider.createPost!({
                title: "Author resolution test",
                content: "Body",
                excerpt: "",
                authorId,
                published: false
            } satisfies PostCreateExtendedInput)

            expect(created.authorId).toBe(authorId)
            expect(created.author).toBeDefined()
            expect(created.author).toEqual(
                expect.objectContaining({
                    id: authorId,
                    name: "olliethedev",
                    image: "https://avatars.githubusercontent.com/u/123456789?v=4"
                })
            )

            const fetched = await provider.getPostBySlug!(created.slug)
            expect(fetched).not.toBeNull()
            if (!fetched) return
            expect(fetched.authorId).toBe(authorId)
            expect(fetched.author).toEqual(
                expect.objectContaining({
                    id: authorId,
                    name: "olliethedev",
                    image: "https://avatars.githubusercontent.com/u/123456789?v=4"
                })
            )
        })
    })
}

function tagStringToTagCreate(tagString: string): TagConnectOrCreate {
    return {
        tag: {
            connectOrCreate: {
                where: { name: tagString },
                create: { name: tagString, slug: slugify(tagString) }
            }
        }
    }
}

function comparePostShapes(expected: Post, actual: Post): void {
    // Compare core shape excluding author fields that are resolved externally
    const {
        author: _ignoredAuthor,
        tags: expectedTags,
        ...expectedRest
    } = expected

    expect(actual).toMatchObject({
        ...expectedRest,
        id: expect.any(String),
        tags: expect.arrayContaining(
            expectedTags.map(({ id: _ignore, ...rest }) =>
                expect.objectContaining(rest)
            )
        )
    })

    if (actual.author === null) {
        // Validate author presence is external and only id is required when present
        expect(actual.author).toBeNull()
    } else {
        expect(actual.author).toEqual(
            expect.objectContaining({ id: expect.any(String) })
        )
    }
}
