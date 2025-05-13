import React from 'react';
import {Routes, Route} from 'react-router-dom';
import "./App.css";
import MainPage from "./pages/MainPage";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import AuthNavBar from "./components/AuthNavBar/AuthNavBar";
import NavBar from "./components/NavBar/NavBar";
import AuthFooter from "./components/AuthFooter/AuthFooter";
import Footer from "./components/Footer/Footer";

function App() {
    const isLogin = false;
    return (
        <div className="App">
            {isLogin ? (
                <AuthNavBar></AuthNavBar>
            ) : (
                <NavBar></NavBar>
            )}
            <div className="PageContent">
                <Routes>
                    <Route path="/" element={<MainPage isLogin={isLogin}/>}/>
                    <Route path="/registration" element={<Registration isLogin={isLogin}/>}/>
                    <Route path="/login" element={<Login isLogin={isLogin}/>}/>
                </Routes>
            </div>

            {isLogin ? (
                <AuthFooter></AuthFooter>
            ) : (
                <>
                    <Footer></Footer>
                </>
            )}
        </div>
        // <div className="App">
        //   <MainPage isLogin={isLogin}></MainPage>
        // </div>

    );
}

export default App;
