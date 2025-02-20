"use client";

import { useState, useCallback } from "react";

import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { type Provider } from "@reown/appkit-adapter-solana/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { Check } from "lucide-react";


function Auth() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const [status, setStatus] = useState<string>("Not authenticated");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const authenticate = useCallback(async () => {
    if (!address || !walletProvider || !isConnected) {
      setStatus("Wallet not connected");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Requesting nonce...");

      //Request nonce
      const nonceResponse = await fetch(
        `/api/auth/createNonce?wallet=${address.toString()}`
      );
      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce");
      }
      const { nonce } = await nonceResponse.json();

      await new Promise(resolve => setTimeout(resolve, 200));

      setStatus("Please sign the message in your wallet...");
      const message = new TextEncoder().encode(
        `Sign this message for authentication: ${nonce}`
      );
      const signature = await walletProvider.signMessage(message);
      const signatureString = Buffer.from(signature).toString("base64");

      //Verify nonce
      setStatus("Verifying signature...");
      const verifyResponse = await fetch("/api/auth/verifyNonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address.toString(),
          nonce,
          signature: signatureString,
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (verifyResult.verified) {
        setStatus("Authenticated successfully!");
      } else {
        setStatus(
          `Verification failed: ${verifyResult.error || "Unknown error"}`
        );
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  return (
    <div className="w-full">
      <Card className="w-full mx-auto max-w-2xl mt-[20vh] bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">
            Solana Wallet Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-zinc-400">Wallet</div>
            <code className="block bg-black/50 p-3 rounded-lg text-sm text-zinc-100 font-mono break-all">
              {address ? address.toString() : "Not connected"}
            </code>
          </div>
          {status === "Authenticated successfully!" ? (
            <Alert className="border-green-500/20 bg-green-500/10">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500 ml-2">
                {status}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertDescription className="text-red-500 ml-2">
                {status}
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full"
            onClick={authenticate}
            disabled={!address || !walletProvider || isLoading}
          >
            {isLoading ? "Processing..." : "Authenticate"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Auth;
