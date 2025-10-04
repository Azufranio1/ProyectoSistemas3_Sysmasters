import React from "react";


const Home: React.FC = () => {
  return (
    <div>
      <h1>Dashboard — SugarDonuts</h1>
      <p>Resumen rápido (ejemplo):</p>

      <div className="cards">
        <div className="card">
          <h3>Ventas hoy</h3>
          <p>$120</p>
        </div>
        <div className="card">
          <h3>Pedidos pendientes</h3>
          <p>3</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
