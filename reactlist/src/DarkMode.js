import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function DarkMode({ darkMode, toggleDarkMode }) {
  return (
    <label>
      <FontAwesomeIcon
        icon={darkMode ? ['fas', 'moon'] : ['fas', 'sun']}
        onClick={toggleDarkMode}
        style={{ cursor: 'pointer' }}
      />
    </label>
  );
}

DarkMode.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
};

export default DarkMode;