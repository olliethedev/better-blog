import type React from "react"

type Props = {
    children: React.ReactNode
    // mimic minimal props we use in tests
    remarkPlugins?: unknown
    rehypePlugins?: unknown
    components?: unknown
}

export default function ReactMarkdownShim({ children }: Props) {
    return <div data-testid="react-markdown">{children}</div>
}
