import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import "./App.css";
import MainPage from "./pages/MainPage";
import Registration from "./pages/Registration";

function App() {
    const isLogin = false;
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={<MainPage isLogin={isLogin}/>}/>
                    <Route path="/registration" element={<Registration isLogin={isLogin}/>}/>
                </Routes>
            </Router>
        </div>
        // <div className="App">
        //   <MainPage isLogin={isLogin}></MainPage>
        // </div>

    );
}

export default App;
