import React from 'react';
import PropTypes from 'prop-types';

function Login({ handleLogin }) {
  return (
    <div className='login-button'>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

Login.propTypes = {
  handleLogin: PropTypes.func.isRequired,
};

export default Login;