import Form from "../components/Form"; // Import Form component for handling the login form
import logo from "../images/logo.jpeg"; // Import the logo image for the header
import womanWriting from "../images/womanWriting.jpeg"; // Import image for the "woman writing" visual
import "../styles/loginRegLayout.css"; // Import styling for the login and registration layout

function Login() {
  return (
    <div className="loginpage-container">
      {" "}
      {/* Container for the entire page */}
      <div className="logincontent-container">
        {" "}
        {/* Container to hold both the image section and form section */}
        <div className="loginimage-section">
          {" "}
          {/* Section containing the image and logo */}
          <header className="loginheader">
            {" "}
            {/* Header for the logo */}
            <div className="loginlogo-section">
              {" "}
              {/* Section for the logo */}
              <img
                src={logo}
                alt="TaleSpace Logo"
                className="login-logo"
              />{" "}
              {/* Display the logo */}
              <span className="loginlogo-text">TaleSpace</span>{" "}
              {/* Display the logo text */}
            </div>
          </header>
          <img src={womanWriting} alt="Woman Writing" className="auth-image" />{" "}
          {/* Display the image of a woman writing */}
        </div>
        <div className="loginform-section">
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
