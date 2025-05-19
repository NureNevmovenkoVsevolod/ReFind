import React from "react";
import AuthHeroSection from "../components/AuthHeroSection/AuthHeroSection";
import HeroSection from "../components/HeroSection/HeroSection";
import CurrentFindsSection from "../components/CurrentFindsSection/CurrentFindsSection";
import CurrentLossesSection from "../components/CurrentLossesSection/CurrentLossesSection";

function MainPage(props) {
  const isLogin = props.isLogin;
  return (
    <div>
      {isLogin ? (
        <AuthHeroSection></AuthHeroSection>
      ) : (
        <HeroSection></HeroSection>
      )}
      <CurrentFindsSection />
      <CurrentLossesSection />
    </div>
  );
}

export default MainPage;
