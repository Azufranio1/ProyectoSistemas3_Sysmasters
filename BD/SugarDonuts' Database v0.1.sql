DROP DATABASE IF EXISTS SugarDonuts;
CREATE DATABASE SugarDonuts;
USE SugarDonuts;

CREATE TABLE Sucursal (
    SucursalID VARCHAR(10) PRIMARY KEY NOT NULL,
    HoraApertura VARCHAR(10) NOT NULL,
    Departamento VARCHAR(50) NOT NULL,
    Zona VARCHAR(50) NOT NULL,
    HoraCierre VARCHAR(10) NOT NULL
);

CREATE TABLE Empleado(
    EmpleadoID varchar(10) not null primary key,
    CI int(10) not null,
    Nombre varchar(50) not null,
    Apellido varchar(50) not null,
    FechaContrato date not null,
    FechaNacimiento date not null,
    Activo boolean not null default 0,
    Habilitado boolean not null default 1
);

CREATE TABLE UsuarioEmp (
    EmpleadoID varchar(10) not null unique primary key,
    Usuario varchar(50) not null,
    Correo varchar(50) not null,
    Keyword varchar(100) not null,
    CodRecuperacion int(8) not null,
    Habilitado boolean not null default 1,
    FOREIGN KEY (EmpleadoID) REFERENCES Empleado(EmpleadoID)
);

CREATE TABLE Cliente(
    ClienteID varchar(10) not null primary key,
    Nombre varchar(50) not null,
    Apellido varchar(50) not null,
    CINIT int(12) not null,
    Habilitado boolean not null default 1
);

CREATE TABLE Categoria(
    CategoriaID varchar(10) not null primary key,
    Categoria varchar(30) not null
);

CREATE TABLE Producto(
    ProductoID varchar(10) not null primary key,
    CategoriaID varchar(10) not null,
    PrecioUnitario int not null,
    Nombre varchar(100) not null,
    Habilitado boolean not null default 1,
    FOREIGN KEY (CategoriaID) REFERENCES Categoria(CategoriaID)
);

CREATE TABLE Venta(
    VentaID varchar(10) not null primary key,
    EmpleadoID varchar(10) not null,
    ClienteID varchar(10) not null,
    FechaVenta date not null,
    Descuento int not null,
    Total int not null,
    FOREIGN KEY (EmpleadoID) REFERENCES Empleado(EmpleadoID),
    FOREIGN KEY (ClienteID) REFERENCES Cliente(ClienteID)
);

CREATE TABLE DetalleVenta(
    VentaID varchar(10) not null,
    ProductoID varchar(10) not null,
    Cantidad int not null,
    Subtotal int not null,
    FOREIGN KEY (VentaID) REFERENCES Venta(VentaID),
    FOREIGN KEY (ProductoID) REFERENCES Producto(ProductoID)
);

INSERT INTO Empleado (EmpleadoID, CI, Nombre, Apellido, FechaContrato, FechaNacimiento, Activo, Habilitado) 
VALUES ('MGR-001', 12345678, 'Azu', 'Ninsial', '2025-08-15', '1992-04-18', 1, 1);

INSERT INTO UsuarioEmp (EmpleadoID, Usuario, Correo, Keyword, CodRecuperacion, Habilitado) 
VALUES ('MGR-001', 'AzuMGR', 'azumgr@sugardonuts.com', '$2y$10$ETWi3mZz0fXhCiPYluGn.uCkNmdYLCzMW/W0YXgxoHRHYTeyBwJcG', 123456, 1);

INSERT INTO Empleado (EmpleadoID, CI, Nombre, Apellido, FechaContrato, FechaNacimiento, Activo, Habilitado) 
VALUES ('EMP-001', 12345678, 'Azuf', 'Ninsial', '2025-08-15', '1992-04-18', 1, 1);

INSERT INTO UsuarioEmp (EmpleadoID, Usuario, Correo, Keyword, CodRecuperacion, Habilitado) 
VALUES ('EMP-001', 'AzuEMP', 'azuemp@sugardonuts.com', '$2y$10$ETWi3mZz0fXhCiPYluGn.uCkNmdYLCzMW/W0YXgxoHRHYTeyBwJcG', 123456, 1);