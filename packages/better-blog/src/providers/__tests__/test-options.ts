import type { BlogDataProviderConfig } from "@/types"

export const getAuthor: BlogDataProviderConfig["getAuthor"] = async (
    id: string
) => {
    return {
        id,
        name: "olliethedev",
        image: "https://avatars.githubusercontent.com/u/123456789?v=4"
    }
}
