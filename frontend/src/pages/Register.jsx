import Form from "../components/Form"; 
import logo from "../images/logo.jpeg"; 
import womanWriting from "../images/womanWriting.jpeg"; 
import "../styles/loginRegLayout.css"; 

function Register() {
  return (
    <div className="loginpage-container">
      {" "}
      <div className="logincontent-container">
        {" "}
        <div className="loginimage-section">
          {" "}
          <header className="loginheader">
            {" "}
            <div className="loginlogo-section">
              {" "}
              <img
                src={logo}
                alt="TaleSpace Logo"
                className="login-logo"
              />{" "}
              <span className="loginlogo-text">TaleSpace</span>{" "}
            </div>
          </header>
          <img src={womanWriting} alt="Woman Writing" className="auth-image" />{" "}
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

export default Register; 
