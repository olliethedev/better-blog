type Props = {
    value?: string
    onChange?: (markdown: string) => void
    className?: string
}

export function MarkdownEditor({ value = "", onChange, className }: Props) {
    return (
        <textarea
            data-testid="markdown-editor-mock"
            className={className}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
        />
    )
}
