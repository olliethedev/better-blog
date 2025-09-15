export function PageHeader({
    title,
    description
}: {
    title: string
    description: string
}) {
    return (
        <div className="flex max-w-[600px] flex-col items-center gap-4 text-center">
            <h1 className="font-medium font-sans text-6xl tracking-tight">
                {title}
            </h1>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}
