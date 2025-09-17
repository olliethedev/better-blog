import MultipleSelector, { type Option } from "@/components/ui/multi-select"
import { useTags } from "@/hooks"

export function TagsMultiSelect({
    value,
    onChange
}: {
    value: string
    onChange: (value: string) => void
}) {
    const { tags } = useTags()

    const options: Option[] = (tags || []).map((tag) => ({
        value: tag.name,
        label: tag.name
    }))

    // Convert comma-separated string to array for internal use
    const tagNamesArray = value
        ? value
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
        : []

    const selectedOptions: Option[] = tagNamesArray.map((tagName) => ({
        value: tagName,
        label: tagName
    }))

    const handleChange = (newOptions: Option[]) => {
        // Convert array back to comma-separated string
        const tagNamesString = newOptions
            .map((option) => option.value)
            .join(", ")
        onChange(tagNamesString)
    }

    return (
        <MultipleSelector
            value={selectedOptions}
            onChange={handleChange}
            placeholder="Search or create tags..."
            options={options}
            creatable={true}
            hidePlaceholderWhenSelected={true}
            className="w-full"
        />
    )
}
