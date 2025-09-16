import { expect, test } from "@playwright/test"

test("posts page renders", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })

    await page.goto("/posts", { waitUntil: "networkidle" })
    await expect(
        page.getByRole("heading", { name: /blog posts/i })
    ).toBeVisible()
    // expect(errors, `Console errors detected: \n${errors.join("\n")}`).toEqual([])
})


