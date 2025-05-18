import { useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export default function MiniKitProvider({ children }) {
  useEffect(() => {
    MiniKit.install({ appId: import.meta.env.VITE_WLD_CLIENT_ID });
    console.log(MiniKit.isInstalled());
  }, []);

  return <>{children}</>;
}