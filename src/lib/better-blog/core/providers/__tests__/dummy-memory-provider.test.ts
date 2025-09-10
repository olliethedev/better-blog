import { createDummyMemoryDBProvider } from "../dummy-memory-db-provider"
import { commonProviderTests } from "./common-provider-tests"

describe("Dummy Memory DB Provider", () => {
    it("should create a dummy memory db provider", () => {
        const provider = createDummyMemoryDBProvider()
        expect(provider).toBeDefined()
    })
    commonProviderTests(() => createDummyMemoryDBProvider())
})
