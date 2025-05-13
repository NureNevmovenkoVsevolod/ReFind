import React from "react";
import AuthNavBar from "../components/AuthNavBar/AuthNavBar";
import NavBar from "../components/NavBar/NavBar";
import AuthHeroSection from "../components/AuthHeroSection/AuthHeroSection";
import HeroSection from "../components/HeroSection/HeroSection";
import CurrentFindsSection from "../components/CurrentFindsSection/CurrentFindsSection";
import CurrentLossesSection from "../components/CurrentLossesSection/CurrentLossesSection";
import AuthFooter from "../components/AuthFooter/AuthFooter";
import Footer from "../components/Footer/Footer";

function MainPage(props) {
    const isLogin = props.isLogin;
    return (
        <div>
            {isLogin ? (
                <AuthHeroSection></AuthHeroSection>
            ) : (
                <HeroSection></HeroSection>
            )}
            <CurrentFindsSection/>
            <CurrentLossesSection/>

        </div>
    );
}

export default MainPage;
