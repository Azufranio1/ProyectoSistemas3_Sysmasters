import React from "react";

interface HeaderProps {
  nombreCompleto: string;
}

const Header: React.FC<HeaderProps> = ({ nombreCompleto }) => {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-end px-6">
      <p className="text-gray-700 font-semibold">
        Bienvenido, <span className="font-bold">{nombreCompleto}</span>
      </p>
    </header>
  );
};

export default Header;
