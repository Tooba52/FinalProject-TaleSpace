import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import CreateBook from "./pages/CreateBook";
import WriteBook from "./pages/WriteBook";
import Profile from "./pages/profile";
import Settings from "./pages/Settings";
import BrowseGenre from "./pages/BrowseGenre";
import ProtectedRoute from "./components/ProtectedRoute";
import ReadBook from "./pages/ReadBook";
import BookSettings from "./pages/BookSettings";

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
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
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
        <Route
          path="/browse/:genreName"
          element={
            <ProtectedRoute>
              <BrowseGenre />
            </ProtectedRoute>
          }
        />
        <Route
          path="/read/:book_id"
          element={
            <ProtectedRoute>
              <ReadBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/read/:book_id/chapters/:chapter_id"
          element={
            <ProtectedRoute>
              <ReadBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:book_id"
          element={
            <ProtectedRoute>
              <BookSettings />
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
