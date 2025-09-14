"use client";

import type { RouteMatch } from "@/types"
import React from "react"

export interface RouteContextValue {
  routeMatch: RouteMatch;
}

const RouteContext = React.createContext<RouteContextValue | null>(null);

export function useRoute(): RouteContextValue {
  const context = React.useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
}

export interface RouteProviderProps {
  routeMatch: RouteMatch;
  children: React.ReactNode;
}

export function RouteProvider({ routeMatch, children }: RouteProviderProps) {
  const contextValue: RouteContextValue = {
    routeMatch,
  };

  return (
    <RouteContext.Provider value={contextValue}>
      {children}
    </RouteContext.Provider>
  );
}