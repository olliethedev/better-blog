import { expect, test } from "@playwright/test"

const contentSelector = '[data-testid="blog-page-root"]'
const emptySelector = '[data-testid="empty-state"]'
const errorSelector = '[data-testid="error-placeholder"]'

test("posts page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })

    await page.goto("/posts", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    await expect(page).toHaveTitle(/Blog Posts/i)
    // Either posts list renders or empty state shows when no posts
    const emptyVisible = await page.locator(emptySelector).isVisible().catch(() => false)
    if (!emptyVisible) {
        await expect(page.getByTestId("page-header")).toBeVisible()
    }
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})

test("post page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })

    await page.goto("/posts/hello-world", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    await expect(page).toHaveTitle(/Hello World/i)
    // Shows post content or empty placeholder when slug not found
    const notFound = await page.locator(emptySelector).isVisible().catch(() => false)
    if (!notFound) {
        await expect(page.getByTestId("page-title")).toBeVisible()
    }
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})

test("edit post page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/hello-world/edit", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    await expect(page).toHaveTitle(/Editing: hello-world/i)
    // Edit form should render or empty state if post is missing
    const maybeEmpty = await page.locator(emptySelector).isVisible().catch(() => false)
    if (!maybeEmpty) {
        await expect(page.getByTestId("page-header")).toBeVisible()
    }
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})

test("new post page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/new", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    await expect(page).toHaveTitle(/Create New Post/i)
    // New page should not be an error; header should be present
    await expect(page.getByTestId("page-header")).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})

test("drafts page renders", async ({ page }) => {

    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/drafts", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    await expect(page).toHaveTitle(/My Drafts/i)
    // Either drafts render or empty state appears when none exist
    const maybeEmpty = await page.locator(emptySelector).isVisible().catch(() => false)
    if (!maybeEmpty) {
        await expect(page.getByTestId("page-header")).toBeVisible()
    }
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})


test("tag page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/tag/react", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    await expect(page).toHaveTitle(/Posts tagged: react/i)
    // Tag page shows list or empty state when no posts with tag
    const maybeEmpty = await page.locator(emptySelector).isVisible().catch(() => false)
    if (!maybeEmpty) {
        await expect(page.getByTestId("page-header")).toBeVisible()
    }
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})


test("unknown page state renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/unknown", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    await expect(page).toHaveTitle(/(Unknown route|Post: unknown)/i)
    // Unknown slug should render empty-state or error placeholder; wait for either to appear
    await expect(
        page.locator(`${emptySelector}, ${errorSelector}`)
    ).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})

test("unknown edit page state renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/unknown/edit", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    await expect(page).toHaveTitle(/(Unknown route|Editing: unknown)/i)
    // Unknown edit page should render empty-state or error placeholder; wait for either to appear
    await expect(
        page.locator(`${emptySelector}, ${errorSelector}`)
    ).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})


test("unknown tag page state renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/tag/unknown", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    await expect(page).toHaveTitle(/Posts tagged: unknown|Unknown route/i)
    // Unknown tag should render an empty-state
    await expect(page.locator(emptySelector)).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})




