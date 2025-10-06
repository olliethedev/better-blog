import { buildPath, normalizeBasePath, stripBasePath } from "../utils"

describe("stripBasePath", () => {
    describe("single-segment basePath", () => {
        it("strips single-segment basePath from path", () => {
            expect(stripBasePath("/blog/my-post", "/blog")).toBe("/my-post")
        })

        it("handles path equal to basePath", () => {
            expect(stripBasePath("/blog", "/blog")).toBe("/")
        })

        it("does not strip if path doesn't start with basePath", () => {
            expect(stripBasePath("/posts/my-post", "/blog")).toBe(
                "/posts/my-post"
            )
        })
    })

    describe("multi-segment basePath", () => {
        it("strips multi-segment basePath correctly", () => {
            expect(stripBasePath("/blog/posts/my-article", "/blog/posts")).toBe(
                "/my-article"
            )
        })

        it("strips three-segment basePath", () => {
            expect(
                stripBasePath("/app/blog/posts/my-article", "/app/blog/posts")
            ).toBe("/my-article")
        })

        it("handles nested paths with multi-segment basePath", () => {
            expect(
                stripBasePath(
                    "/blog/posts/category/tech/my-post",
                    "/blog/posts"
                )
            ).toBe("/category/tech/my-post")
        })

        it("handles path equal to multi-segment basePath", () => {
            expect(stripBasePath("/blog/posts", "/blog/posts")).toBe("/")
        })

        it("does not strip if only first segment matches", () => {
            // This tests the bug we fixed - should NOT strip if only first segment matches
            expect(stripBasePath("/blog/other/my-post", "/blog/posts")).toBe(
                "/blog/other/my-post"
            )
        })
    })

    describe("edge cases", () => {
        it("handles empty basePath", () => {
            expect(stripBasePath("/blog/my-post", "")).toBe("/blog/my-post")
        })

        it("handles root basePath", () => {
            expect(stripBasePath("/blog/my-post", "/")).toBe("/blog/my-post")
        })

        it("handles basePath without leading slash", () => {
            expect(stripBasePath("/blog/my-post", "blog")).toBe("/my-post")
        })

        it("handles path without leading slash", () => {
            expect(stripBasePath("blog/my-post", "/blog")).toBe("/my-post")
        })

        it("handles basePath with trailing slash", () => {
            expect(stripBasePath("/blog/posts/my-post", "/blog/posts/")).toBe(
                "/my-post"
            )
        })
    })

    describe("realistic scenarios", () => {
        it("works with tag routes", () => {
            expect(
                stripBasePath("/blog/posts/tag/typescript", "/blog/posts")
            ).toBe("/tag/typescript")
        })

        it("works with drafts routes", () => {
            expect(stripBasePath("/blog/posts/drafts", "/blog/posts")).toBe(
                "/drafts"
            )
        })

        it("works with edit routes", () => {
            expect(
                stripBasePath("/blog/posts/edit/my-post", "/blog/posts")
            ).toBe("/edit/my-post")
        })

        it("works with deeply nested paths", () => {
            expect(
                stripBasePath(
                    "/api/v2/blog/posts/2024/01/my-post",
                    "/api/v2/blog/posts"
                )
            ).toBe("/2024/01/my-post")
        })
    })
})

describe("normalizeBasePath", () => {
    it("adds leading slash if missing", () => {
        expect(normalizeBasePath("blog")).toBe("/blog")
    })

    it("removes trailing slash", () => {
        expect(normalizeBasePath("/blog/")).toBe("/blog")
    })

    it("keeps root path as is", () => {
        expect(normalizeBasePath("/")).toBe("/")
    })

    it("handles already normalized paths", () => {
        expect(normalizeBasePath("/blog/posts")).toBe("/blog/posts")
    })
})

describe("buildPath", () => {
    it("builds path with single-segment basePath", () => {
        expect(buildPath("/blog", "my-post")).toBe("/blog/my-post")
    })

    it("builds path with multi-segment basePath", () => {
        expect(buildPath("/blog/posts", "my-post")).toBe("/blog/posts/my-post")
    })

    it("handles multiple segments", () => {
        expect(buildPath("/blog", "tag", "typescript")).toBe(
            "/blog/tag/typescript"
        )
    })

    it("filters out undefined and null segments", () => {
        expect(buildPath("/blog", undefined, "my-post", null)).toBe(
            "/blog/my-post"
        )
    })

    it("handles root basePath", () => {
        expect(buildPath("/", "my-post")).toBe("/my-post")
    })

    it("handles empty basePath", () => {
        expect(buildPath("", "my-post")).toBe("/my-post")
    })
})
