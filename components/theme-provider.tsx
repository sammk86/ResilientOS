"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Helper to suppress hydration warning
// see: https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
