import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import SplashBackground from "../../components/Splash/SplashBackground";
import SplashLogoCircle from "../../components/Splash/SplashLogoCircle";
import SplashLoader from "../../components/Splash/SplashLoader";

const LOGO = require("./../../assets/images/2.png");

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {

      router.push("/");
    }, 2600);

    return () => clearTimeout(t);
  }, []);

  return (
    <SplashBackground>
      <SplashLogoCircle
        logoSource={LOGO}
      />
      <SplashLoader />
    </SplashBackground>
  );
}
