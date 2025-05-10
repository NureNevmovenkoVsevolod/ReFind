import "./App.css";
import NavBar from "./components/NavBar/NavBar";
import AuthNavBar from "./components/AuthNavBar/AuthNavBar";
import HeroSection from "./components/HeroSection/HeroSection";
import CurrentFindsSection from "./components/CurrentFindsSection/CurrentFindsSection";

function App() {
  const isLogin = false;
  return (
    <div className="App">
      {isLogin ? (
        <AuthNavBar></AuthNavBar>
      ) : (
        <>
          <NavBar></NavBar>
          <HeroSection></HeroSection>
        </>
      )}
      <CurrentFindsSection/>
    </div>
  );
}

export default App;
