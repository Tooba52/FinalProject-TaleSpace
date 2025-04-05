import Form from "../components/Form";
import logo from "../images/logo.jpeg"; 
import womanWriting from "../images/womanWriting.jpeg";
import "../styles/loginRegLayout.css";

function Login() {
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
