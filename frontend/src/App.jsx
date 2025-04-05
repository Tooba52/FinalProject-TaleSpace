import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import CreateBook from "./pages/CreateBook";
import WriteBook from "./pages/WriteBook";
import Profile from "./pages/profile";
import ProtectedRoute from "./components/ProtectedRoute";

function Logout() {
  localStorage.clear(); // Remove user session data
  return <Navigate to="/login" />; // Redirect to login page
}

function RegisterAndLogout() {
  localStorage.clear(); // Remove any existing session data
  return <Register />; // Render the Register component
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected Home Route: Only accessible if the user is authenticated */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:book_id/chapters"
          element={
            <ProtectedRoute>
              <WriteBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:book_id/chapters/:chapter_id"
          element={
            <ProtectedRoute>
              <WriteBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-book"
          element={
            <ProtectedRoute>
              <CreateBook />
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />

        {/* Catch-all route for undefined paths, displays a 404 Not Found page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
