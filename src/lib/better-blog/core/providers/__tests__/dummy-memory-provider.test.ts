import { createDummyMemoryDBProvider } from "../dummy-memory-db-provider"
import { commonProviderTests } from "./common-provider-tests"
import { getAuthor } from "./test-options"

describe("Dummy Memory DB Provider", () => {
    it("should create a dummy memory db provider", () => {
        const provider = createDummyMemoryDBProvider({
            getAuthor
        })
        expect(provider).toBeDefined()
    })
    commonProviderTests(() =>
        createDummyMemoryDBProvider({
            getAuthor
        })
    )
})
