import React, { useState, useEffect } from 'react';
import * as sha256 from 'crypto-js/sha256';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import Cookies from 'js-cookie';

function LoginForm() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [successRegister, setSuccessRegister] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
	const userToken = Cookies.get('userToken', {expires: 30});
	if (userToken){
		navigate('/main', {state: {data: userToken}});
	}
  }, [navigate])

  console.log(Cookies.get('userToken'));

  const setCookieAndNavigate = (data) => {
	Cookies.set('userToken', data, {expires: 30});
	navigate('/main', {state: {data: data}});
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const hashedPassword = sha256(password).toString();
    const jsonData = {
      "account": account,
      "passwd": hashedPassword
    };

    const url = isRegister ? 'http://localhost:4000/register' : 'http://localhost:4000/login';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    })
    .then(response => response.text())
    .then(data => {
      if (data === 'Fail to login' || data === 'Fail to register') {
        setIsLogin(false);
		setSuccessRegister(false);
      } else if (data === 'Success register'){
		setIsLogin(true);
		setSuccessRegister(true);
	  } else {
        setIsLogin(true);
        console.log('Success:', data);
        if (!isRegister) {
          navigate('/main', { state: { data: data } });
		  setCookieAndNavigate(data);
        }
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  const toggleForm = () => {
    setIsRegister(!isRegister);
	setSuccessRegister(false);
    setIsLogin(true);
  }

  return (
    <div className="Login">
      <div className="form-container">
        <h2>{isRegister ? 'Register' : 'Login'} Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="account">Account:</label>
            <input 
              type="text" 
              id="account"
              name="account" 
              placeholder="Enter Account" 
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password"
              name="password" 
              placeholder="Enter Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="submit-button">{isRegister ? 'Register' : 'Login'}</button>
          {!isLogin && <div className="error-message">{isRegister ? 'Register before' : 'Login failed. Please try again.'}</div>}
        </form>
        <button onClick={toggleForm} className="toggle-button">
          {isRegister ? 'Switch to Login' : 'Switch to Register'}
        </button>
	      {successRegister && <div className="success-message">Register Success</div>}
      </div>
    </div>
  );
}

export default LoginForm;

