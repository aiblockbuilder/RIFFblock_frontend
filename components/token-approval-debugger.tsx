"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ethers } from 'ethers'

interface TokenApprovalDebuggerProps {
    onClose?: () => void
}

export default function TokenApprovalDebugger({ onClose }: TokenApprovalDebuggerProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [allowance, setAllowance] = useState<string>('')
    const [balance, setBalance] = useState<string>('')
    const [approvalAmount, setApprovalAmount] = useState<string>('1000000') // 1M RIFF tokens
    const { toast } = useToast()

    const checkAllowance = async () => {
        try {
            setIsLoading(true)
            const { contractService } = await import('@/lib/contracts')
            
            const currentAllowance = await contractService.getRiffTokenAllowance()
            const currentBalance = await contractService.getRiffTokenBalance()
            
            setAllowance(ethers.formatUnits(currentAllowance, 18))
            setBalance(ethers.formatUnits(currentBalance, 18))
            
            toast({
                title: "Allowance Check Complete",
                description: `Current allowance: ${ethers.formatUnits(currentAllowance, 18)} RIFF`,
            })
        } catch (error: any) {
            console.error("Error checking allowance:", error)
            toast({
                title: "Error Checking Allowance",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const approveTokens = async () => {
        try {
            setIsLoading(true)
            const { contractService } = await import('@/lib/contracts')
            
            // Convert to wei
            const amountInWei = ethers.parseUnits(approvalAmount, 18)
            
            toast({
                title: "Approving Tokens",
                description: "Please confirm the approval transaction in your wallet...",
            })
            
            const result = await contractService.manualApproveRiffTokens(amountInWei.toString())
            
            toast({
                title: "Approval Successful",
                description: `Successfully approved ${approvalAmount} RIFF tokens. Transaction: ${result.hash}`,
            })
            
            // Refresh allowance
            await checkAllowance()
        } catch (error: any) {
            console.error("Error approving tokens:", error)
            toast({
                title: "Approval Failed",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Token Approval Debugger</CardTitle>
                <CardDescription>
                    Check and fix RIFF token approval issues
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Current Balance:</span>
                        <span className="font-mono">{balance || 'Loading...'} RIFF</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Current Allowance:</span>
                        <span className="font-mono">{allowance || 'Loading...'} RIFF</span>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium">Approval Amount (RIFF)</label>
                    <input
                        type="number"
                        value={approvalAmount}
                        onChange={(e) => setApprovalAmount(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="1000000"
                    />
                </div>
                
                <div className="flex gap-2">
                    <Button 
                        onClick={checkAllowance} 
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1"
                    >
                        Check Allowance
                    </Button>
                    <Button 
                        onClick={approveTokens} 
                        disabled={isLoading}
                        variant="debug"
                        className="flex-1"
                    >
                        Approve Tokens
                    </Button>
                </div>
                
                {onClose && (
                    <Button 
                        onClick={onClose} 
                        variant="outline" 
                        className="w-full"
                    >
                        Close
                    </Button>
                )}
            </CardContent>
        </Card>
    )
} 