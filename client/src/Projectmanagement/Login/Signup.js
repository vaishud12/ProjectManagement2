import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./login.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../components/images/logo.png";
import * as API from "../../components/Endpoints/Endpoint";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill all the fields");
    } else {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      try {
        const response = await fetch(API.SIGNUP, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success("Signup successful! Please log in.");
          navigate("/verifyotp");
        } else {
          toast.error("Signup failed: " + data.message);
        }
      } catch (err) {
        toast.error("Error: " + err.message);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="container">
        <div className="row cdvfdfd">
          <div className="col-lg-10 col-md-12 login-box">
            <div className="row">
              <div className="col-lg-6 col-md-6 log-det">
                <div className="small-logo">
                  <img
                    src={logo}
                    alt="Logo"
                    style={{ width: "150px", height: "auto" }}
                  />
                </div>
                <p className="dfmn">
                  Welcome! Begin your journey with us by creating your account.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="text-box-cont">
                    <input
                      type="name"
                      className="form-control"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <div className="input-group center">
                      <button
                        className="btn btn-round btn-signup"
                        type="submit"
                      >
                        SIGN UP
                      </button>
                    </div>
                    <div className="row">
                      <p className="forget-p">
                        Already have an account?{" "}
                        <Link style={{ color: "#ff3131" }} to="/login">
                          Log in
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
              <div className="col-lg-6 col-md-6 box-de">
                <div className="inn-cover">
                  <div className="ditk-inf">
                    <h2 className="w-100 text-light">Create Your Account</h2>
                    <p>
                      Join us and create your account to access exclusive
                      features tailored just for you. Experience seamless
                      navigation, personalized content, and more. Start your
                      journey with us today!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
