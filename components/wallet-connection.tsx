"use client";

import { request } from "@stacks/connect";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "@/hooks/wallet";
import { useAuthSession } from "@/providers/auth-session-provider";

export function WalletConnection() {
  const { session } = useAuthSession();
  const {
    data,
    isConnected,
    connect,
    disconnect,
    loginWithWallet,
    generateAuthMessage,
  } = useWallet();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogin = async () => {
    if (!data?.address) return;

    try {
      setIsLoggingIn(true);
      setError(null);

      // Generate auth message
      const message = await generateAuthMessage(data.address);

      // Sign the message with the user's wallet
      const { signature } = await request("stx_signMessage", {
        message,
      });

      await loginWithWallet({
        walletAddress: data.address,
        signature,
        message,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">CoreMint</CardTitle>
          <CardDescription>
            Connect your Stacks wallet to start minting NFTs
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!isConnected ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Connect your Stacks wallet to interact with the application
                </p>
              </div>

              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                {session?.user && (
                  <>
                    <p className="text-sm font-medium text-green-800">
                      User Logged In
                    </p>
                    <p className="text-xs text-green-600 mt-1 break-all mb-4">
                      User ID: {session.user.id}
                    </p>
                  </>
                )}
                <p className="text-sm font-medium text-green-800">
                  Wallet Connected
                </p>
                <p className="text-xs text-green-600 mt-1 break-all">
                  {data?.address}
                </p>
                {data?.publicKey && (
                  <p className="text-xs text-green-600 mt-1 break-all">
                    Public Key: {data?.publicKey.slice(0, 20)}...
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {session ? (
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    className="flex-1"
                  >
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleLogin}
                      disabled={isLoggingIn}
                      className="flex-1"
                    >
                      {isLoggingIn ? "Logging in..." : "Login"}
                    </Button>

                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      className="flex-1"
                    >
                      Disconnect
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              CoreMint - NFT minting platform on Stacks blockchain
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
