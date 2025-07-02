'use client'

import { useState, useEffect } from 'react'
import { contractService } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'

export default function NetworkStatus() {
    const [network, setNetwork] = useState<{ chainId: string; name: string } | null>(null)
    const [isOnAmoy, setIsOnAmoy] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const checkNetwork = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const currentNetwork = await contractService.getCurrentNetwork()
            const onAmoy = await contractService.isOnAmoyTestnet()
            
            setNetwork(currentNetwork)
            setIsOnAmoy(onAmoy)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const switchToAmoy = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            await contractService.ensureCorrectNetwork()
            await checkNetwork()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        checkNetwork()
        
        // Listen for network changes
        if (typeof window !== 'undefined' && window.ethereum) {
            const handleChainChanged = () => {
                checkNetwork()
            }
            
            window.ethereum.on('chainChanged', handleChainChanged)
            
            return () => {
                window.ethereum.removeListener('chainChanged', handleChainChanged)
            }
        }
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Checking network...</span>
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Network error: {error}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-2"
                        onClick={checkNetwork}
                    >
                        Retry
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }

    if (!network) {
        return (
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    No wallet connected. Please connect your wallet to continue.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                    {isOnAmoy ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium">Network Status</span>
                </div>
                <Badge variant={isOnAmoy ? "default" : "secondary"}>
                    {network.name} ({network.chainId})
                </Badge>
            </div>
            
            {!isOnAmoy && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        You need to be on Polygon Amoy Testnet to use this application.
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2"
                            onClick={switchToAmoy}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                    Switching...
                                </>
                            ) : (
                                'Switch to Amoy'
                            )}
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
} 