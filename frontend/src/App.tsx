import LoginPage from "./components/pages/Login.tsx";
import SignupPage from "./components/pages/Signup.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./components/pages/Home.tsx";
import Navbar from "./components/myComponents/Navbar.tsx";
import AuthProvider from "./context/AuthProvider.tsx";
import AuthComponent from "./components/myComponents/AuthComponent.tsx";
import Dashboard from "./components/pages/Dashboard.tsx";
import BoardView from "./components/pages/BoardView.tsx";

export default function App() {

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route element={<AuthComponent />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/board/:id" element={<BoardView />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </Router >
    </AuthProvider>
  )
}
