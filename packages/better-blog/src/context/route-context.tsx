"use client"

import React from "react"
import type { RouteContextValue, RouteProviderProps } from "./types"

export const RouteContext = React.createContext<RouteContextValue | null>(null)

export function RouteProvider({ type, params, children }: RouteProviderProps) {
    const contextValue: RouteContextValue = {
        type,
        params
    }

    return (
        <RouteContext.Provider value={contextValue}>
            {children}
        </RouteContext.Provider>
    )
}
