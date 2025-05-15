"use client"

import { createContext, useContext, type ReactNode } from "react"
import api, { userApi, riffApi, nftApi, stakingApi, tokenApi } from "@/services/api"

interface ApiContextType {
    api: typeof api
    user: typeof userApi
    riff: typeof riffApi
    nft: typeof nftApi
    staking: typeof stakingApi
    token: typeof tokenApi
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

export const ApiProvider = ({ children }: { children: ReactNode }) => {
    const value = {
        api,
        user: userApi,
        riff: riffApi,
        nft: nftApi,
        staking: stakingApi,
        token: tokenApi,
    }

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export const useApi = () => {
    const context = useContext(ApiContext)
    if (context === undefined) {
        throw new Error("useApi must be used within an ApiProvider")
    }
    return context
}
