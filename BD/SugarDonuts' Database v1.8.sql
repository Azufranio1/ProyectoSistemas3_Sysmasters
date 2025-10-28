-- DROP DATABASE IF EXISTS SugarDonuts;
-- CREATE DATABASE SugarDonuts;
-- USE SugarDonuts;

DROP TABLE IF EXISTS DetalleReserva;
DROP TABLE IF EXISTS Reserva;
DROP TABLE IF EXISTS DetalleVenta;
DROP TABLE IF EXISTS Venta;
DROP TABLE IF EXISTS Producto;
DROP TABLE IF EXISTS Categoria;
DROP TABLE IF EXISTS Cliente;
DROP TABLE IF EXISTS UsuarioEmp;
DROP TABLE IF EXISTS Empleado;
DROP TABLE IF EXISTS Sucursal;










CREATE TABLE Sucursal (
    SucursalID VARCHAR(10) PRIMARY KEY NOT NULL,
    HoraApertura VARCHAR(10) NOT NULL,
    Departamento VARCHAR(50) NOT NULL,
    Zona VARCHAR(50) NOT NULL,
    HoraCierre VARCHAR(10) NOT NULL
);

CREATE TABLE Empleado(
    EmpleadoID varchar(10) not null primary key,
    SucursalID varchar(10) not null,
    CI int not null,
    Nombre varchar(50) not null,
    Apellido varchar(50) not null,
    FechaContrato date not null,
    FechaNacimiento date not null,
    Activo boolean not null default 0,
    Habilitado boolean not null default 1,
    FOREIGN KEY (SucursalID) REFERENCES Sucursal(SucursalID)
);

CREATE TABLE UsuarioEmp (
    EmpleadoID varchar(10) not null primary key,
    Usuario varchar(50) not null,
    Correo varchar(50) not null,
    Keyword varchar(100) not null,
    CodRecuperacion int not null,
    Habilitado boolean not null default 1,
    FOREIGN KEY (EmpleadoID) REFERENCES Empleado(EmpleadoID)
);

CREATE TABLE Cliente(
    ClienteID varchar(10) not null primary key,
    Nombre varchar(50) not null,
    Apellido varchar(50) not null,
    CINIT int not null,
    Habilitado boolean not null default 1
);

CREATE TABLE Categoria(
    CategoriaID varchar(10) not null primary key,
    Categoria varchar(30) not null
);

CREATE TABLE Producto(
    ProductoID varchar(10) not null primary key,
    CategoriaID varchar(10) not null,
    Nombre varchar(100) not null,
    Descripcion varchar(255) null,
    PrecioUnitario decimal(5,2) not null,
    Habilitado boolean not null default 1,
    -- UltimaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoriaID) REFERENCES Categoria(CategoriaID)
);

ALTER TABLE Producto
MODIFY PrecioUnitario DECIMAL(10,2) NOT NULL;

CREATE TABLE Venta(
    VentaID varchar(10) not null primary key,
    EmpleadoID varchar(10) not null,
    ClienteID varchar(10) not null,
    FechaVenta date not null,
    Descuento int not null,
    Total int not null,
    Archivada boolean not null default 0,
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

CREATE TABLE Reserva(
    ReservaID VARCHAR(10) NOT NULL PRIMARY KEY,
    ClienteID VARCHAR(10) NOT NULL,
    EmpleadoID VARCHAR(10) NULL,
    FechaReserva DATETIME NOT NULL,
    FechaRecogida DATETIME NOT NULL,
    Estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'Confirmada', 'Lista', 'Entregada', 'Cancelada')),
    Total INT NOT NULL,
    Archivada BOOLEAN NOT NULL DEFAULT 0,
    Habilitado BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (ClienteID) REFERENCES Cliente(ClienteID),
    FOREIGN KEY (EmpleadoID) REFERENCES Empleado(EmpleadoID)
);

CREATE TABLE DetalleReserva(
    ReservaID VARCHAR(10) NOT NULL,
    ProductoID VARCHAR(10) NOT NULL,
    Cantidad INT NOT NULL,
    Subtotal INT NOT NULL,
    PRIMARY KEY (ReservaID, ProductoID),
    FOREIGN KEY (ReservaID) REFERENCES Reserva(ReservaID) ON DELETE CASCADE,
    FOREIGN KEY (ProductoID) REFERENCES Producto(ProductoID)
);

-- Inserciones para Sucursal
INSERT INTO Sucursal (SucursalID, HoraApertura, Departamento, Zona, HoraCierre)
VALUES ('SUC-001', '08:00', 'La Paz', 'Sopocachi', '19:00');
INSERT INTO Sucursal (SucursalID, HoraApertura, Departamento, Zona, HoraCierre)
VALUES ('SUC-002', '08:00', 'La Paz', 'Miraflores', '19:00');

-- Inserciones para Empleado y Usuarios
INSERT INTO Empleado (EmpleadoID, CI, Nombre, Apellido, FechaContrato, FechaNacimiento, Activo, Habilitado, SucursalID) 
VALUES ('MGR-001', 12345678, 'Azu', 'Ninsial', '2025-08-15', '1992-04-18', 1, 1, 'SUC-001');
INSERT INTO UsuarioEmp (EmpleadoID, Usuario, Correo, Keyword, CodRecuperacion, Habilitado) 
VALUES ('MGR-001', 'AzuMGR', 'azumgr@sugardonuts.com', '$2y$10$ETWi3mZz0fXhCiPYluGn.uCkNmdYLCzMW/W0YXgxoHRHYTeyBwJcG', 123456, 1);

INSERT INTO Empleado (EmpleadoID, CI, Nombre, Apellido, FechaContrato, FechaNacimiento, Activo, Habilitado, SucursalID) 
VALUES ('EMP-001', 12345678, 'Azuf', 'Ninsial', '2025-08-15', '1992-04-18', 1, 1, 'SUC-001');
INSERT INTO UsuarioEmp (EmpleadoID, Usuario, Correo, Keyword, CodRecuperacion, Habilitado) 
VALUES ('EMP-001', 'AzuEMP', 'azuemp@sugardonuts.com', '$2y$10$ETWi3mZz0fXhCiPYluGn.uCkNmdYLCzMW/W0YXgxoHRHYTeyBwJcG', 123456, 1);

INSERT INTO Empleado (EmpleadoID, CI, Nombre, Apellido, FechaContrato, FechaNacimiento, Activo, Habilitado, SucursalID) 
VALUES ('MGR-002', 23456789, 'Alexandra', 'Mamani', '2025-08-16', '1992-05-26', 1, 1, 'SUC-001');
INSERT INTO UsuarioEmp (EmpleadoID, Usuario, Correo, Keyword, CodRecuperacion, Habilitado) 
VALUES ('MGR-002', 'AleMGR', 'aledun@sugardonuts.com', '$2y$10$QEAiiONHkXyXuPmm.noyjOpK4MuUJh5HkjAsSe.2KHli6wZjs8HD6', 170524, 1);

INSERT INTO Empleado (EmpleadoID, CI, Nombre, Apellido, FechaContrato, FechaNacimiento, Activo, Habilitado, SucursalID) 
VALUES ('EMP-002', 23456789, 'Alexandra', 'Mamani', '2025-08-16', '1992-05-26', 1, 1, 'SUC-001');
INSERT INTO UsuarioEmp (EmpleadoID, Usuario, Correo, Keyword, CodRecuperacion, Habilitado) 
VALUES ('EMP-002', 'AleEMP', 'aledune@sugardonuts.com', '$2y$10$QEAiiONHkXyXuPmm.noyjOpK4MuUJh5HkjAsSe.2KHli6wZjs8HD6', 170524, 1);

INSERT INTO Empleado (EmpleadoID, CI, Nombre, Apellido, FechaContrato, FechaNacimiento, Activo, Habilitado, SucursalID) 
VALUES ('MGR-003', 34567890, 'Mateo', 'Torrez', '2025-08-16', '1992-05-26', 1, 1, 'SUC-001');
INSERT INTO UsuarioEmp (EmpleadoID, Usuario, Correo, Keyword, CodRecuperacion, Habilitado) 
VALUES ('MGR-003', 'TaptoMGR', 'taptomax@sugardonuts.com', '$2y$10$HCnLMk6ERv0tY8bV/.f/tugVI3lYkFf8zfJHd/kFsrFX0LR0wF9GC', 123456, 1);

INSERT INTO Empleado (EmpleadoID, CI, Nombre, Apellido, FechaContrato, FechaNacimiento, Activo, Habilitado, SucursalID) 
VALUES ('EMP-003', 34567890, 'Mateo', 'Torrez', '2025-08-16', '1992-05-26', 1, 1, 'SUC-001');
INSERT INTO UsuarioEmp (EmpleadoID, Usuario, Correo, Keyword, CodRecuperacion, Habilitado) 
VALUES ('EMP-003', 'TaptoEMP', 'taptomaxe@sugardonuts.com', '$2y$10$HCnLMk6ERv0tY8bV/.f/tugVI3lYkFf8zfJHd/kFsrFX0LR0wF9GC', 123456, 1);

-- Inserciones para Producto y Categoria
INSERT INTO Categoria (CategoriaID, Categoria) VALUES ('CAT-001', 'Donas');
INSERT INTO Categoria (CategoriaID, Categoria) VALUES ('CAT-002', 'Café');
INSERT INTO Categoria (CategoriaID, Categoria) VALUES ('CAT-003', 'Sandwiches');
INSERT INTO Categoria (CategoriaID, Categoria) VALUES ('CAT-004', 'Té');
INSERT INTO Categoria (CategoriaID, Categoria) VALUES ('CAT-005', 'Batidos');


INSERT INTO Producto (ProductoID, CategoriaID, Nombre, Descripcion, PrecioUnitario) 
VALUES 
('PRD-001', 'CAT-001', 'Choco Sugar', 'Cubierta de chocolate negro con un irresistible roseado de Choco-Ruby.', 7),
('PRD-002', 'CAT-001', 'Choco Oreo', 'Cubierta con un glaseado cremoso coronada con trocitos crujientes de galleta Oreo.', 7),
('PRD-003', 'CAT-001', 'Choco Café', 'Cubierta de un aromático glaseado de café combinado con un toque robusto de chocolate.', 7);

-- ------------------------
-- Inserciones para Clientes
INSERT INTO Cliente (ClienteID, Nombre, Apellido, CINIT, Habilitado)
VALUES 
('CLI-001', 'María', 'Flores', 8569345, 1),
('CLI-002', 'Carlos', 'Gutiérrez', 9246831, 1);

-- Inserciones para Ventas
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES
('VNT-001', 'EMP-001', 'CLI-001', '2025-10-15', 0, 28, 0),
('VNT-002', 'EMP-001', 'CLI-002', '2025-10-15', 2, 26, 0);

-- Inserciones para DetalleVenta
-- Venta 1 (VNT-001): 2 productos, total 28
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-001', 'PRD-001', 2, 14),
('VNT-001', 'PRD-002', 2, 14);

-- Venta 2 (VNT-002): 2 productos, total 26 con descuento aplicado aparte
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-002', 'PRD-002', 1, 7),
('VNT-002', 'PRD-003', 3, 21);

-- ------------------------

INSERT INTO Reserva (ReservaID, ClienteID, EmpleadoID, FechaReserva, FechaRecogida, Estado, Total, Habilitado)
VALUES ('RES-001', 'CLI-001', 'EMP-001', '2025-10-14 10:00:00', '2025-10-15 14:00:00', 'Pendiente', 14, 1);

INSERT INTO DetalleReserva (ReservaID, ProductoID, Cantidad, Subtotal)
VALUES 
('RES-001', 'PRD-001', 1, 7),
('RES-001', 'PRD-002', 1, 7);
