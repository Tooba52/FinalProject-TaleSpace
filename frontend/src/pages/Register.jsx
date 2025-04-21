import Form from "../components/Form";
import logo from "../images/logo.jpeg";
import womanWriting from "../images/womanWriting.jpeg";
import "../styles/loginRegLayout.css";

function Register() {
  return (
    <div className="loginpage-container">
      <div className="logincontent-container">
        {/* left side with logo and image */}
        <div className="loginimage-section">
          <header className="loginheader">
            <div className="loginlogo-section">
              <img src={logo} alt="TaleSpace Logo" className="login-logo" />
              <span className="loginlogo-text">TaleSpace</span>
            </div>
          </header>
          <img src={womanWriting} alt="Woman writing" className="auth-image" />
        </div>

        {/* right side with registration form */}
        <div className="loginform-section">
          <Form route="/api/user/register/" method="register" />
        </div>
      </div>
    </div>
  );
}

export default Register;
