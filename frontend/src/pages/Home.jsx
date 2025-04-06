import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../styles/Home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  // State variables
  const [firstName, setFirstName] = useState("");

  // useEffect hook to fetch
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = () => {
    api
      .get("/api/user/profile/") // Fetch user details
      .then((res) => {
        setFirstName(res.data.first_name); // Set the first name in state
      })
      .catch((err) => console.error("Error fetching user profile", err));
  };

  return (
    <div className="home=page">
      <Navbar variant="transparent" firstName={firstName} />
      <div className="home-container">
        {/* Banner Section */}
        <div className="banner">
          <h2>Welcome to TaleSpace – Where Stories Come to Life!</h2>
          <p>
            TaleSpace is a dynamic platform for writers to create, share, and
            publish stories while readers discover their favorite authors. Start
            writing, explore new worlds, and be part of a growing literary
            universe today!
          </p>
        </div>
      </div>

      <div className="book-container">
        {/* Top 10 Books Section */}
        <section className="top-books">
          <h3>Top 10 Books</h3>
          <div className="book-list">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="book-card">
                <div className="book-icon">📖</div>
                <p>Book Name</p>
              </div>
            ))}
          </div>
          <Link to="/books" className="view-all">
            View All ➤
          </Link>
        </section>

        {/* Top Genres Section */}
        <section className="top-genres">
          <h3>Top Genres</h3>
          <div className="genre-list">
            {[
              "Romance",
              "Fantasy",
              "Action",
              "Comedy",
              "Mystery",
              "Horror",
              "Sports",
            ].map((genre, index) => (
              <div key={index} className="genre-card">
                <div className="genre-icon">🎭</div>
                <p>{genre}</p>
              </div>
            ))}
          </div>
          <Link to="/books" className="view-all">
            View All ➤
          </Link>
        </section>

        {/* Top Authors Section */}
        <section className="top-authors">
          <h3>Top Authors</h3>
          <div className="author-list">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="author-card">
                <div className="author-icon">👤</div>
                <p>Author Name</p>
              </div>
            ))}
          </div>
          <Link to="/books" className="view-all">
            View All ➤
          </Link>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Home;
