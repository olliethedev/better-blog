import type { Post } from "@/types";
import { slugify } from "./format-utils";


export const getTestPosts = () => {
    const tagNames = [
        "Intro",
        "React",
        "CSS",
        "JavaScript",
        "Git",
        "Node",
        "Database",
        "TypeScript",
        "Testing",
        "Deployment",
        "Docker",
        "GraphQL",
        "Performance",
        "Security",
        "Tooling"
    ]


    const testPosts: Post[] = Array.from({ length: 15 }, (_, i) => {
        const idx = i + 1
        const date = new Date(`2024-01-${ String(idx).padStart(2, "0") }`)
        const name = tagNames[i % tagNames.length]
        const tag = { id: String(i + 1), name, slug: slugify(name) }
        const isDraft = idx % 5 === 0 // every 5th post is a draft
        return {
            id: String(idx),
            slug: slugify(
                [
                    "hello-world",
                    "react-tips",
                    "css-basics",
                    "js-arrays",
                    "git-basics",
                    "node-express",
                    "database-tips",
                    "typescript-intro",
                    "testing-basics",
                    "deployment",
                    "docker-basics",
                    "graphql-intro",
                    "performance-tuning",
                    "security-checklist",
                    "dev-tooling"
                ][i]
            ),
            title: [
                "Hello World",
                "React Tips",
                "CSS Basics",
                "JS Arrays",
                "Git Basics",
                "Node Express",
                "Database Tips",
                "TypeScript Intro",
                "Testing Basics",
                "Deployment",
                "Docker Basics",
                "GraphQL Intro",
                "Performance Tuning",
                "Security Checklist",
                "Dev Tooling"
            ][i],
            content: i === 0
                ? FULL_MARKDOWN
                : "This is a sample post for demo purposes. It contains enough text to be searchable.",
            excerpt: "Excerpt for demo post.",
            published: !isDraft,
            publishedAt: isDraft ? undefined : date,
            tags: [tag],
            createdAt: date,
            updatedAt: date,
            image: "https://placehold.co/600x400/png",
            author: { id: "1", name: "John Doe" }
        } satisfies Post
    })
    return testPosts
};export const FULL_MARKDOWN = `

# Markdown Showcase  

This document shows different **Markdown features**, including **unterminated blocks**, GitHub Flavored Markdown (GFM), math rendering, links, images, annotations, blockquotes, code blocks, and nested lists.

---


- **Bold text**
- *Italic text*
- \`Inline code\`
- [Link](https://github.com)
- # Heading

---

## GitHub Flavored Markdown  

### Tables  

| Name    | Role         | Active |
|---------|-------------|--------|
| Ollie   | Developer   | ✅     |
| Alice   | Designer    | ❌     |
| Bob     | PM          | ✅     |

### Task Lists  

- [x] Write docs  
- [ ] Fix bugs  
- [ ] Add more tests  

### Strikethrough  

This feature was ~~removed~~ replaced.

---

## Links and Images  

Here’s a proper link: [Visit GitHub](https://github.com)  

Here’s an image:  

![Placeholder Image](https://placehold.co/600x400/png)  

---

## Blockquotes  

> This is a blockquote.  
>> This is a nested blockquote.  

---

## Code Block (JavaScript)  

\`\`\`js
function greet(name) {
  return \`Hello, USER!\`;
}

console.log(greet("Ollie"));
\`\`\`

---

## Nested Lists

1. First item

   * Sub-item 1
   * Sub-item 2

     * Deeper sub-item
2. Second item

---

## Math Rendering (KaTeX)

Inline math: \$E = mc^2\$

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

---

## Annotations Example

Here’s some text with an annotation.[^1]
We can also add multiple annotations like this.[^2]

[^1]: This is the first annotation explaining a detail.

[^2]: Another annotation, often used for references or notes.

`

