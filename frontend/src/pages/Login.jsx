// Code resued from: 
// Author: Tech With Tim
// Video Title: Django & React Web App Tutorial - Authentication, Databases, Deployment & More...
// Video Link:  https://www.youtube.com/watch?v=c-QsfbznSXI 
// Code reused Lines - 7-42, changes made include ??

import Form from "../components/Form";
import logo from "../images/logo.jpeg";
import womanWriting from "../images/womanWriting.jpeg";
import "../styles/loginRegLayout.css";

function Login() {
  return (
    <div className="loginpage-container">
      <div className="logincontent-container">
        {/* left side with logo and image */}
        <div className="loginimage-section">
          <header className="loginheader">
            <div className="loginlogo-section">
              <img 
                src={logo}
                alt="TaleSpace Logo" 
                className="login-logo"
              />
              <span className="loginlogo-text">TaleSpace</span>
            </div>
          </header>
          <img 
            src={womanWriting} 
            alt="Woman Writing" 
            className="auth-image" 
          />
        </div>

        {/* right side with login form */}
        <div className="loginform-section">
          <Form route="/api/token/" method="login" />
        </div>
      </div>
    </div>
  );
}

export default Login;