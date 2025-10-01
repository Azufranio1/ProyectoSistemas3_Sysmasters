import React from "react";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <AppRoutes />
      </main>
    </div>
  );
};

export default App;
