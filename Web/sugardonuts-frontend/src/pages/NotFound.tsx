import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h1>404</h1>
      <p>Oye... ¿cómo llegaste aquí? Esta página no existe 🤔</p>
      <Link to="/">Volver al dashboard</Link>
    </div>
  );
};

export default NotFound;
