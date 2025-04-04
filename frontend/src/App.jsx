// Import necessary modules from React Router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import page components
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import CreateBook from "./pages/CreateBook";
import WriteBook from "./pages/WriteBook";
import Profile from "./pages/profile";

// Import protected route component to restrict access to authenticated users
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * Logout Component:
 * Clears localStorage to remove authentication tokens and user data,
 * then redirects the user to the login page.
 */
function Logout() {
  localStorage.clear(); // Remove user session data
  return <Navigate to="/login" />; // Redirect to login page
}

/**
 * RegisterAndLogout Component:
 * Ensures that when a user visits the register page, any previous session is cleared.
 * This prevents logged-in users from trying to re-register while still authenticated.
 */
function RegisterAndLogout() {
  localStorage.clear(); // Remove any existing session data
  return <Register />; // Render the Register component
}

/**
 * App Component:
 * Defines the main routing structure of the application using React Router.
 */
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

// Export the App component as the main entry point of the application
export default App;
