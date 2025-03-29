import Form from "../components/Form"; // Import Form component for handling the login form
import logo from "../images/logo.jpeg"; // Import the logo image for the header
import womanWriting from "../images/womanWriting.jpeg"; // Import image for the "woman writing" visual
import "../styles/loginRegLayout.css"; // Import styling for the login and registration layout

function Login() {
  return (
    <div className="page-container">
      {" "}
      {/* Container for the entire page */}
      <div className="content-container">
        {" "}
        {/* Container to hold both the image section and form section */}
        <div className="image-section">
          {" "}
          {/* Section containing the image and logo */}
          <header className="header">
            {" "}
            {/* Header for the logo */}
            <div className="logo-section">
              {" "}
              {/* Section for the logo */}
              <img src={logo} alt="TaleSpace Logo" className="logo" />{" "}
              {/* Display the logo */}
              <span className="logo-text">TaleSpace</span>{" "}
              {/* Display the logo text */}
            </div>
          </header>
          <img src={womanWriting} alt="Woman Writing" className="auth-image" />{" "}
          {/* Display the image of a woman writing */}
        </div>
        <div className="form-section">
          {" "}
          {/* Section for the login form */}
          <Form route="/api/token/" method="login" />{" "}
          {/* Passes the login route and method to the Form component */}
        </div>
      </div>
    </div>
  );
}

export default Login;
