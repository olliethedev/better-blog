import { matchRoute } from "../router"

describe("matchRoute", () => {
    test("matches home /", () => {
        const match = matchRoute([])
        expect(match.type).toBe("home")
        expect(match.metadata.title).toBeDefined()
    })

    test("prioritizes static /new over dynamic /:slug", () => {
        const match = matchRoute(["new"])
        expect(match.type).toBe("new")
    })

    test("matches dynamic /:slug for arbitrary slug", () => {
        const match = matchRoute(["hello-world"])
        expect(match.type).toBe("post")
        expect(match.params?.slug).toBe("hello-world")
    })

    test("matches /drafts as drafts route", () => {
        const match = matchRoute(["drafts"])
        expect(match.type).toBe("drafts")
    })

    test("matches /:slug/edit as edit route", () => {
        const match = matchRoute(["my-post", "edit"])
        expect(match.type).toBe("edit")
        expect(match.params?.slug).toBe("my-post")
    })

    test("matches /tag/:tag as tag route", () => {
        const match = matchRoute(["tag", "react"])
        expect(match.type).toBe("tag")
        expect(match.params?.tag).toBe("react")
    })

    test("returns unknown for undefined routes", () => {
        const match = matchRoute(["does-not-exist", "deep"])
        expect(match.type).toBe("unknown")
        expect(match.metadata.title).toContain(
            "Unknown route: /does-not-exist/deep"
        )
    })
})

describe("matchRoute with basePath stripping", () => {
    const basePath = "/posts"

    test("strips basePath and matches home /", () => {
        const match = matchRoute(["posts"], basePath)
        expect(match.type).toBe("home")
    })

    test("strips basePath and matches /new", () => {
        const match = matchRoute(["posts", "new"], basePath)
        expect(match.type).toBe("new")
    })

    test("strips basePath and matches dynamic /:slug", () => {
        const match = matchRoute(["posts", "hello-world"], basePath)
        expect(match.type).toBe("post")
        expect(match.params?.slug).toBe("hello-world")
    })

    test("strips basePath and matches /drafts", () => {
        const match = matchRoute(["posts", "drafts"], basePath)
        expect(match.type).toBe("drafts")
    })

    test("strips basePath and matches /:slug/edit", () => {
        const match = matchRoute(["posts", "my-post", "edit"], basePath)
        expect(match.type).toBe("edit")
        expect(match.params?.slug).toBe("my-post")
    })

    test("strips basePath and matches /tag/:tag", () => {
        const match = matchRoute(["posts", "tag", "react"], basePath)
        expect(match.type).toBe("tag")
        expect(match.params?.tag).toBe("react")
    })

    test("strips basePath and returns unknown for undefined routes", () => {
        const match = matchRoute(["posts", "does-not-exist", "deep"], basePath)
        expect(match.type).toBe("unknown")
    })

    test('basePath normalization variants are handled ("posts" and "/posts/")', () => {
        expect(matchRoute(["posts", "new"], "posts").type).toBe("new")
        expect(matchRoute(["posts", "new"], "/posts/").type).toBe("new")
    })
})
