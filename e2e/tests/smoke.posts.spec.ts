import { expect, test } from "@playwright/test"

const contentSelector = '[data-testid="blog-page-root"]'

test("posts page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })

    await page.goto("/posts", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})

test("post page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })

    await page.goto("/posts/hello-world", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})

test("edit post page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/hello-world/edit", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})

test("new post page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/new", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})

test("drafts page renders", async ({ page }) => {

    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/drafts", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})


test("tag page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/tag/react", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})


test("unknown page state renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/unknown", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})

test("unknown edit page state renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/unknown/edit", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})


test("unknown tag page state renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/posts/tag/unknown", { waitUntil: "networkidle" })
    await expect(page.locator(contentSelector)).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})




