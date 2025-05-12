import "./App.css";
import MainPage from "./pages/MainPage";

function App() {
  const isLogin = false;
  return (
    <div className="App">
      <MainPage isLogin={isLogin}></MainPage>
    </div>
  );
}

export default App;
