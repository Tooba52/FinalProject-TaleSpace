import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/About.css";

function About() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // get current user info 
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/auth/user/");
      setCurrentUser(response.data);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  return (
    <div className="about-page">
      <Navbar />
      <div className="about-container">
        {/* main banner section */}
        <div className="banner">
          <h2>About TaleSpace</h2>
          <p>
            TaleSpace is more than just a writing platform – it's a space where
            imagination, expression, and community come together. Whether you're
            an aspiring author or an enthusiastic reader, TaleSpace offers you a
            welcoming, creative environment to explore and grow.
          </p>
        </div>
      </div>

      {/* content sections container */}
      <div className="book-container">
        {/* mission section */}
        <section className="about-section">
          <h3>Our Mission</h3>
          <p>
            We aim to empower writers to share their stories with the world and
            give readers a personalized and diverse experience across genres,
            cultures, and voices. TaleSpace bridges the gap between storytellers
            and story lovers.
          </p>
        </section>

        {/* features section */}
        <section className="about-section">
          <h3>Why TaleSpace?</h3>
          <ul>
            <li>
              ✍️ Easy-to-use book writing tools with chapter-by-chapter
              management
            </li>
            <li>📚 A rich library of genres and trending stories</li>
            <li>👥 A growing community of writers and readers</li>
            <li>📈 Discover top authors, explore new books, and get noticed</li>
          </ul>
        </section>

        {/* join us section */}
        <section className="about-section">
          <h3>Join the Journey</h3>
          <p>
            Whether you're here to write your first novel or binge-read fantasy
            adventures, TaleSpace welcomes you. We're constantly evolving — and
            you're part of the story.
          </p>
        </section>

        {/* copyright section */}
        <section className="about-section">
          <h3>Copyright & Intellectual Property</h3>
          <p>
            All content created and shared by users on TaleSpace is the
            exclusive intellectual property of the respective creators. By
            publishing on TaleSpace, you retain full rights to your work. We
            respect and protect the rights of all our creators. If you have any
            questions regarding copyright or content ownership, please contact
            us at support@talespace.com.
          </p>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export default About;
