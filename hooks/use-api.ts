"use client"

import { useState, useEffect, useCallback } from "react"

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    initialData?: T
    immediate?: boolean
}

export function useApi<T = any>(apiFunction: (...args: any[]) => Promise<{ data: T }>, options: UseApiOptions<T> = {}) {
    const { onSuccess, onError, initialData, immediate = false } = options

    const [data, setData] = useState<T | undefined>(initialData)
    const [isLoading, setIsLoading] = useState(immediate)
    const [error, setError] = useState<Error | null>(null)

    const execute = useCallback(
        async (...args: any[]) => {
            try {
                setIsLoading(true)
                setError(null)

                const response = await apiFunction(...args)
                setData(response.data)

                if (onSuccess) {
                    onSuccess(response.data)
                }

                return response.data
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err))
                setError(error)

                if (onError) {
                    onError(error)
                }

                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [apiFunction, onSuccess, onError],
    )

    useEffect(() => {
        if (immediate) {
            execute()
        }
    }, [immediate, execute])

    return {
        data,
        isLoading,
        error,
        execute,
        setData,
    }
}
