"use client";

import { useEffect, useState } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";

export default function ConnectButton() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleConnect = async () => {
    if (!isConnected) {
      open();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent backdrop-blur-lg backdrop-filter pt-5">
      <nav className="mx-auto w-full max-w-screen-xl flex items-center justify-end py-4 px-5 md:p-5">
        {isClient && isConnected ? (
          <appkit-button />
        ) : (
          <Button
            onClick={() => {
              handleConnect();
            }}
            className="bg-oga-green p-3 sm:p-4 border border-green-500 text-white  text-sm md:text-lg rounded-full lg:text-lg lg:px-6 lg:py-3"
          >
            Connect Wallet
          </Button>
        )}
      </nav>
    </header>
  );
}
