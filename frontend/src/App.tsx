import "./App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Login from "./views/auth/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
