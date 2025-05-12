import "./App.css";
import NavBar from "./components/NavBar/NavBar";
import AuthNavBar from "./components/AuthNavBar/AuthNavBar";
import HeroSection from "./components/HeroSection/HeroSection";
import CurrentFindsSection from "./components/CurrentFindsSection/CurrentFindsSection";
import CurrentLossesSection from "./components/CurrentLossesSection/CurrentLossesSection";
import Footer from "./components/Footer/Footer";
import AuthFooter from "./components/AuthFooter/AuthFooter";

function App() {
  const isLogin = false;
  return (
    <div className="App">
      {isLogin ? (
        <AuthNavBar></AuthNavBar>
      ) : (
        <>
          <NavBar></NavBar>
        </>
      )}
      <HeroSection></HeroSection>
      <CurrentFindsSection />
      <CurrentLossesSection />
      {isLogin ? (
        <AuthFooter></AuthFooter>
      ) : (
        <>
          <Footer></Footer>
        </>
      )}
    </div>
  );
}

export default App;
