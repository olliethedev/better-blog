import { getAuthor } from "../../providers/__tests__/test-options"
import { createMemoryProvider } from "../memory/memory-provider"
import { commonProviderTests } from "./common-provider-tests"

describe("Dummy Memory DB Provider", () => {
    it("should create a dummy memory db provider", async () => {
        const provider = await createMemoryProvider({
            getAuthor
        })
        expect(provider).toBeDefined()
    })
    commonProviderTests(() =>
        createMemoryProvider({
            getAuthor
        })
    )
})
