import { getAuthor } from "../../providers/__tests__/test-options"
import { createPrismaProvider } from "../prisma-provider"
/** @jest-environment node */
import { commonProviderTests } from "./common-provider-tests"
import { disconnectPrisma, getPrisma } from "./prisma/get-prisma"
import { pushPrismaSchema } from "./prisma/push-prisma"

describe("Prisma provider (SQLite)", () => {
    beforeAll(async () => {
        await pushPrismaSchema()
        const prisma = getPrisma()
        // ensure clean slate
        await prisma.postTag.deleteMany({})
        await prisma.postI18n.deleteMany({})
        await prisma.post.deleteMany({})
        await prisma.tagI18n.deleteMany({})
        await prisma.tag.deleteMany({})
    }, 30000)

    commonProviderTests(() => {
        const prisma = getPrisma()
        return createPrismaProvider({ prisma: prisma, getAuthor })
    })

    afterAll(async () => {
        await disconnectPrisma()
    })
})


