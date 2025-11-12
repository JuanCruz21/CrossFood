import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import SplashBackground from "../../components/SplashBackground";
import SplashLogo from "../../components/SplashLogo";
import Loader from "../../components/Loader";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SplashBackground>
      <SplashLogo />
      <Loader />
    </SplashBackground>
  );
}
