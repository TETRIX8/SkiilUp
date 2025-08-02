import React from 'react';
import './Error404.css';

const Error404 = () => {
  return (
    <div className="error404-app">
      <div className="error404-error">
        404
      </div>
      <div className="error404-img">
        <img src="/img/cat.png" alt="cat" />
        <h1 className="error404-okak">ОКАК</h1>
      </div>
    </div>
  );
};

export default Error404; 