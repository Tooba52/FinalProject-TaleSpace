import Form from "../components/Form";
import logo from "../images/logo.jpeg";
import womanWriting from "../images/womanWriting.jpeg";
import "../styles/loginRegLayout.css";

function Login() {
  return (
    <div className="page-container">
      <div className="content-container">
        <div className="image-section">
          <header className="header">
            <div className="logo-section">
              <img src={logo} alt="TaleSpace Logo" className="logo" />
              <span className="logo-text">TaleSpace</span>
            </div>
          </header>
          <img src={womanWriting} alt="Woman Writing" className="auth-image" />
        </div>

        <div className="form-section">
          <Form route="/api/token/" method="login" />
        </div>
      </div>
    </div>
  );
}

export default Login;
