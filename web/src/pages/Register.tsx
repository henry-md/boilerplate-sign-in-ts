import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import useAuth from "../hooks/use-auth";

const Signup = () => {
  const { register } = useAuth();
  
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: "",
  });
  const { email, password, username } = inputValue;
  const handleOnChange = (e: any) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log('registering');
    try {
      const result = await register(email, username, password);
      console.log('result', result);
      if (!result.success) {
        toast.error(result.error, {
          position: "bottom-left",
        });
        return;
      }
      navigate("/dashboard");
    } catch (error) {
      console.error('error', error);
      toast.error('An error occurred', {
        position: "bottom-left",
      });
    }
  
  };

  return (
    <div className="h-[100vh] w-full flex justify-center items-center">
      <div className="form-container">
        <h2>Signup Account</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={handleOnChange}
            />
          </div>
          <div>
            <label htmlFor="email">Username</label>
            <input
              type="text"
              name="username"
              value={username}
              placeholder="Enter your username"
              onChange={handleOnChange}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={handleOnChange}
            />
          </div>
          <button type="submit">Submit</button>
          <span>
            Already have an account? <Link to={"/login"}>Login</Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;