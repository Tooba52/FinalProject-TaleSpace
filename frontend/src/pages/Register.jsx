import Form from "../components/Form"; // Importing the reusable Form component
import logo from "../images/logo.jpeg"; // Importing the TaleSpace logo
import womanWriting from "../images/womanWriting.jpeg"; // Image to display in the background
import "../styles/loginRegLayout.css"; // Importing the stylesheet for layout

function Register() {
  return (
    <div className="loginpage-container">
      {" "}
      {/* Outer container for the registration page */}
      <div className="logincontent-container">
        {" "}
        {/* Container for the content (image and form) */}
        <div className="loginimage-section">
          {" "}
          {/* Section for the image on the left */}
          <header className="loginheader">
            {" "}
            {/* Header containing the logo */}
            <div className="loginlogo-section">
              {" "}
              {/* Logo section */}
              <img
                src={logo}
                alt="TaleSpace Logo"
                className="login-logo"
              />{" "}
              {/* Display the TaleSpace logo */}
              <span className="loginlogo-text">TaleSpace</span>{" "}
              {/* Display the brand name */}
            </div>
          </header>
          <img src={womanWriting} alt="Woman Writing" className="auth-image" />{" "}
          {/* Image on the right */}
        </div>
        <div className="loginform-section">
          {" "}
          {/* Section for the registration form */}
          <Form route="/api/user/register/" method="register" />{" "}
          {/* Passing registration route and method to Form component */}
        </div>
      </div>
    </div>
  );
}

export default Register; // Export the Register component to be used elsewhere
