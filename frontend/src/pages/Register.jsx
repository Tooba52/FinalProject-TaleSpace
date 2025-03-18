import Form from "../components/Form";
import logo from "../images/logo.jpeg";
import womanWriting from "../images/womanWriting.png";
import "../styles/loginRegLayout.css";

function Register() {
  return (
    <div className="page-container">
      <header className="header">
        <div className="logo-section">
          <img src={logo} alt="TaleSpace Logo" className="logo" />
          <span className="logo-text">TaleSpace</span>
        </div>
      </header>

      <div className="content-container">
        <div className="image-section">
          <img src={womanWriting} alt="Woman Writing" className="auth-image" />
        </div>

        <div className="form-section">
          <Form route="/api/user/register/" method="register" />
        </div>
      </div>
    </div>
  );
}

export default Register;
