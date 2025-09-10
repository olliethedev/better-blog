/** @type {import('jest').Config} */
export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
    moduleNameMapper: {
        "^@/components/better-blog/forms/markdown-editor$":
            "<rootDir>/src/test/shims/markdown-editor-mock.tsx",
        "^\\./markdown-editor$":
            "<rootDir>/src/test/shims/markdown-editor-mock.tsx",
        "^@/(.*)$": "<rootDir>/src/$1",
        "^react-markdown$": "<rootDir>/src/test/shims/react-markdown-shim.tsx",
        "^rehype-highlight$":
            "<rootDir>/src/test/shims/rehype-highlight-shim.ts",
        "^remark-gfm$": "<rootDir>/src/test/shims/remark-gfm-shim.ts",
        "^.+\\.(css|less|scss)$": "<rootDir>/src/test/shims/style-shim.ts"
    },
    transform: {
        "^.+\\.(ts|tsx)$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: {
                    jsx: "react-jsx"
                }
            }
        ]
    },
    extensionsToTreatAsEsm: [".ts", ".tsx"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    testPathIgnorePatterns: [
        "<rootDir>/docs/",
        // Helper shared test definitions, not a runnable test suite
        "<rootDir>/src/lib/better-blog/core/providers/__tests__/common-provider-tests.ts",
        "<rootDir>/src/lib/better-blog/core/providers/__tests__/migrations",
        "<rootDir>/src/lib/better-blog/core/providers/__tests__/test-options.ts",
        "<rootDir>/src/lib/better-blog/core/providers/__tests__/prisma/get-prisma.ts",
        "<rootDir>/src/lib/better-blog/core/providers/__tests__/prisma/push-prisma.ts"
    ],
    testMatch: [
        "<rootDir>/src/**/__tests__/**/*.(ts|tsx)",
        "<rootDir>/src/**/*.(test|spec).(ts|tsx)"
    ],
    collectCoverageFrom: [
        "src/**/*.(ts|tsx)",
        "!src/**/*.d.ts",
        "!src/test/**/*",
        "!src/types/**/*"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    testTimeout: 10000
}