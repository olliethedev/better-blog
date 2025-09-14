import { getAuthor } from "../../providers/__tests__/test-options"
import { createDummyMemoryDBProvider } from "../dummy-memory-db-provider"
import { commonProviderTests } from "./common-provider-tests"

describe("Dummy Memory DB Provider", () => {
    it("should create a dummy memory db provider", async () => {
        const provider = await createDummyMemoryDBProvider({
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
