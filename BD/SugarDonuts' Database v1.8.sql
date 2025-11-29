DROP DATABASE IF EXISTS SugarDonuts;
CREATE DATABASE SugarDonuts;
USE SugarDonuts;

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

INSERT INTO Empleado (EmpleadoID, CI, Nombre, Apellido, FechaContrato, FechaNacimiento, Activo, Habilitado, SucursalID) 
VALUES ('EMP-004', 23456189, 'Alexa', 'Mamani', '2025-08-26', '1999-05-26', 1, 1, 'SUC-001');
INSERT INTO UsuarioEmp (EmpleadoID, Usuario, Correo, Keyword, CodRecuperacion, Habilitado) 
VALUES ('EMP-004', 'AlexaEMP', 'aledune@sugardonuts.com', '$2y$10$QEAiiONHkXyXuPmm.noyjOpK4MuUJh5HkjAsSe.2KHli6wZjs8HD6', 170524, 1);

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

INSERT INTO Producto (ProductoID, CategoriaID, Nombre, Descripcion, PrecioUnitario) 
VALUES 
('PRD-004', 'CAT-001', 'Fresa Glaseada', 'Deliciosa dona cubierta con glaseado de fresa y chispas de colores.', 7),
('PRD-005', 'CAT-001', 'Vainilla Crunch', 'Glaseado de vainilla con topping crujiente de almendras caramelizadas.', 7),
('PRD-006', 'CAT-002', 'Latte Clásico', 'Café espresso con leche espumosa, ideal para comenzar el día.', 6),
('PRD-007', 'CAT-002', 'Cappuccino', 'Espresso con leche vaporizada y espuma de leche coronada con cacao.', 6),
('PRD-008', 'CAT-003', 'Club Sandwich', 'Pan tostado relleno de jamón, pollo, lechuga, tomate y mayonesa.', 12),
('PRD-009', 'CAT-003', 'Veggie Delight', 'Sandwich saludable con vegetales frescos y hummus cremoso.', 11),
('PRD-010', 'CAT-004', 'Té Verde', 'Infusión de hojas de té verde para un momento relajante y saludable.', 5),
('PRD-011', 'CAT-004', 'Té de Frutas', 'Mezcla de frutas tropicales infusionadas, refrescante y aromático.', 5),
('PRD-012', 'CAT-005', 'Batido de Fresa', 'Bebida cremosa de fresa natural con un toque de yogurt.', 8),
('PRD-013', 'CAT-005', 'Batido de Chocolate', 'Chocolate intenso mezclado con leche fresca, dulce y cremoso.', 8),
('PRD-014', 'CAT-001', 'Glaseado Caramelo', 'Dona cubierta de caramelo líquido con chispas de chocolate blanco.', 7),
('PRD-015', 'CAT-001', 'Choco Menta', 'Glaseado de chocolate con un refrescante toque de menta.', 7),
('PRD-016', 'CAT-002', 'Americano', 'Café negro filtrado con cuerpo y aroma intenso.', 5),
('PRD-017', 'CAT-003', 'Sandwich de Pollo', 'Pan artesanal con pollo asado, queso, lechuga y aderezo especial.', 12),
('PRD-018', 'CAT-003', 'Sandwich de Atún', 'Relleno de atún fresco con mayonesa ligera y vegetales frescos.', 11),
('PRD-019', 'CAT-004', 'Té Negro', 'Té clásico de hojas negras con aroma intenso y sabor equilibrado.', 5),
('PRD-020', 'CAT-004', 'Té Chai', 'Infusión de especias y té negro con un aroma cálido y reconfortante.', 5),
('PRD-021', 'CAT-005', 'Batido de Mango', 'Mango natural con leche y un toque de miel, cremoso y dulce.', 8),
('PRD-022', 'CAT-005', 'Batido Verde', 'Mezcla de espinaca, manzana y plátano, nutritivo y refrescante.', 8),
('PRD-023', 'CAT-001', 'Dona Sprinkles', 'Clásica cubierta de chocolate con sprinkles de colores.', 7);

-- ------------------------
-- Inserciones para Clientes
INSERT INTO Cliente (ClienteID, Nombre, Apellido, CINIT, Habilitado)
VALUES 
('CLI-001', 'María', 'Flores', 8569345, 1),
('CLI-002', 'Carlos', 'Gutiérrez', 9246831, 1);

INSERT INTO Cliente (ClienteID, Nombre, Apellido, CINIT, Habilitado)
VALUES 
('CLI-003', 'Ana', 'Pérez', 7654321, 1),
('CLI-004', 'Luis', 'Ramírez', 8934210, 1),
('CLI-005', 'Sofía', 'García', 9812345, 1),
('CLI-006', 'Pedro', 'Martínez', 7723456, 1),
('CLI-007', 'Camila', 'Rodríguez', 8945123, 1),
('CLI-008', 'Jorge', 'Fernández', 9012345, 1),
('CLI-009', 'Lucía', 'Vargas', 8123456, 1),
('CLI-010', 'Diego', 'Torres', 7345123, 1),
('CLI-011', 'Valentina', 'Santos', 8654321, 1),
('CLI-012', 'Mateo', 'Castillo', 7981234, 1);

INSERT INTO Cliente (ClienteID, Nombre, Apellido, CINIT, Habilitado)
VALUES ('CLI-013', 'Elena', 'Morales', 8123987, 1);

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

-- Inserciones para Ventas (Octubre 2025)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES
('VNT-003', 'EMP-001', 'CLI-003', '2025-10-01', 0, 45, 0),
('VNT-004', 'EMP-002', 'CLI-004', '2025-10-01', 5, 62, 0),
('VNT-005', 'EMP-001', 'CLI-005', '2025-10-02', 3, 89, 0),
('VNT-006', 'EMP-003', 'CLI-006', '2025-10-02', 0, 52, 0),
('VNT-007', 'EMP-002', 'CLI-007', '2025-10-03', 8, 134, 0),
('VNT-008', 'EMP-001', 'CLI-001', '2025-10-03', 0, 38, 0),
('VNT-009', 'EMP-004', 'CLI-008', '2025-10-04', 12, 156, 0),
('VNT-010', 'EMP-003', 'CLI-002', '2025-10-04', 0, 71, 0),
('VNT-011', 'EMP-002', 'CLI-009', '2025-10-05', 6, 98, 0),
('VNT-012', 'EMP-001', 'CLI-010', '2025-10-05', 0, 43, 0),
('VNT-013', 'EMP-004', 'CLI-003', '2025-10-06', 15, 185, 0),
('VNT-014', 'EMP-003', 'CLI-011', '2025-10-07', 0, 67, 0),
('VNT-015', 'EMP-002', 'CLI-004', '2025-10-08', 4, 82, 0),
('VNT-016', 'EMP-001', 'CLI-012', '2025-10-08', 0, 55, 0),
('VNT-017', 'EMP-004', 'CLI-005', '2025-10-09', 10, 142, 0),
('VNT-018', 'EMP-003', 'CLI-013', '2025-10-10', 0, 76, 0),
('VNT-019', 'EMP-002', 'CLI-001', '2025-10-10', 7, 118, 0),
('VNT-020', 'EMP-001', 'CLI-006', '2025-10-11', 0, 49, 0),
('VNT-021', 'EMP-004', 'CLI-007', '2025-10-12', 9, 126, 0),
('VNT-022', 'EMP-003', 'CLI-008', '2025-10-12', 0, 61, 0),
('VNT-023', 'EMP-002', 'CLI-002', '2025-10-13', 5, 94, 0),
('VNT-024', 'EMP-001', 'CLI-009', '2025-10-14', 0, 39, 0),
('VNT-025', 'EMP-004', 'CLI-010', '2025-10-14', 11, 167, 0),
('VNT-026', 'EMP-003', 'CLI-003', '2025-10-15', 0, 58, 0),
('VNT-027', 'EMP-002', 'CLI-011', '2025-10-16', 6, 103, 0),
('VNT-028', 'EMP-001', 'CLI-004', '2025-10-16', 0, 72, 0),
('VNT-029', 'EMP-004', 'CLI-012', '2025-10-17', 13, 178, 0),
('VNT-030', 'EMP-003', 'CLI-005', '2025-10-18', 0, 84, 0),
('VNT-031', 'EMP-002', 'CLI-013', '2025-10-18', 8, 137, 0),
('VNT-032', 'EMP-001', 'CLI-001', '2025-10-19', 0, 46, 0),
('VNT-033', 'EMP-004', 'CLI-006', '2025-10-20', 14, 193, 0),
('VNT-034', 'EMP-003', 'CLI-007', '2025-10-20', 0, 69, 0),
('VNT-035', 'EMP-002', 'CLI-008', '2025-10-21', 7, 115, 0),
('VNT-036', 'EMP-001', 'CLI-002', '2025-10-22', 0, 53, 0),
('VNT-037', 'EMP-004', 'CLI-009', '2025-10-22', 10, 149, 0),
('VNT-038', 'EMP-003', 'CLI-010', '2025-10-23', 0, 77, 0),
('VNT-039', 'EMP-002', 'CLI-003', '2025-10-24', 9, 131, 0),
('VNT-040', 'EMP-001', 'CLI-011', '2025-10-24', 0, 64, 0),
('VNT-041', 'EMP-004', 'CLI-004', '2025-10-25', 16, 201, 0),
('VNT-042', 'EMP-003', 'CLI-012', '2025-10-26', 0, 81, 0),
('VNT-043', 'EMP-002', 'CLI-005', '2025-10-26', 11, 164, 0),
('VNT-044', 'EMP-001', 'CLI-013', '2025-10-27', 0, 47, 0),
('VNT-045', 'EMP-004', 'CLI-001', '2025-10-28', 12, 172, 0),
('VNT-046', 'EMP-003', 'CLI-006', '2025-10-28', 0, 59, 0),
('VNT-047', 'EMP-002', 'CLI-007', '2025-10-29', 8, 124, 0),
('VNT-048', 'EMP-001', 'CLI-008', '2025-10-30', 0, 73, 0),
('VNT-049', 'EMP-004', 'CLI-002', '2025-10-30', 15, 188, 0),
('VNT-050', 'EMP-003', 'CLI-009', '2025-10-31', 0, 91, 0),
('VNT-051', 'EMP-002', 'CLI-010', '2025-10-31', 6, 108, 0),
('VNT-052', 'EMP-001', 'CLI-003', '2025-10-31', 0, 56, 0);

-- Inserciones para DetalleVenta

-- Venta 3 (VNT-003): 3 productos, total 45
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-003', 'PRD-004', 2, 18),
('VNT-003', 'PRD-007', 1, 12),
('VNT-003', 'PRD-010', 1, 15);

-- Venta 4 (VNT-004): 4 productos, total 67 (descuento 5 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-004', 'PRD-001', 3, 21),
('VNT-004', 'PRD-005', 2, 16),
('VNT-004', 'PRD-008', 1, 13),
('VNT-004', 'PRD-011', 2, 17);

-- Venta 5 (VNT-005): 5 productos, total 92 (descuento 3 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-005', 'PRD-003', 2, 14),
('VNT-005', 'PRD-006', 3, 24),
('VNT-005', 'PRD-009', 1, 19),
('VNT-005', 'PRD-012', 2, 22),
('VNT-005', 'PRD-015', 1, 13);

-- Venta 6 (VNT-006): 3 productos, total 52
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-006', 'PRD-002', 2, 14),
('VNT-006', 'PRD-013', 2, 20),
('VNT-006', 'PRD-016', 1, 18);

-- Venta 7 (VNT-007): 5 productos, total 142 (descuento 8 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-007', 'PRD-004', 3, 27),
('VNT-007', 'PRD-007', 2, 24),
('VNT-007', 'PRD-014', 2, 28),
('VNT-007', 'PRD-017', 1, 22),
('VNT-007', 'PRD-020', 2, 41);

-- Venta 8 (VNT-008): 3 productos, total 38
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-008', 'PRD-005', 1, 8),
('VNT-008', 'PRD-011', 2, 17),
('VNT-008', 'PRD-018', 1, 13);

-- Venta 9 (VNT-009): 4 productos, total 168 (descuento 12 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-009', 'PRD-001', 4, 28),
('VNT-009', 'PRD-008', 3, 39),
('VNT-009', 'PRD-015', 2, 26),
('VNT-009', 'PRD-021', 3, 75);

-- Venta 10 (VNT-010): 4 productos, total 71
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-010', 'PRD-003', 2, 14),
('VNT-010', 'PRD-009', 1, 19),
('VNT-010', 'PRD-012', 1, 11),
('VNT-010', 'PRD-019', 2, 27);

-- Venta 11 (VNT-011): 5 productos, total 104 (descuento 6 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-011', 'PRD-002', 3, 21),
('VNT-011', 'PRD-006', 2, 16),
('VNT-011', 'PRD-010', 1, 15),
('VNT-011', 'PRD-016', 1, 18),
('VNT-011', 'PRD-022', 2, 34);

-- Venta 12 (VNT-012): 3 productos, total 43
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-012', 'PRD-004', 2, 18),
('VNT-012', 'PRD-013', 1, 10),
('VNT-012', 'PRD-020', 1, 15);

-- Venta 13 (VNT-013): 5 productos, total 200 (descuento 15 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-013', 'PRD-005', 4, 32),
('VNT-013', 'PRD-011', 3, 27),
('VNT-013', 'PRD-017', 2, 44),
('VNT-013', 'PRD-021', 3, 75),
('VNT-013', 'PRD-023', 1, 22);

-- Venta 14 (VNT-014): 4 productos, total 67
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-014', 'PRD-007', 2, 24),
('VNT-014', 'PRD-014', 1, 14),
('VNT-014', 'PRD-018', 2, 26),
('VNT-014', 'PRD-001', 1, 3);

-- Venta 15 (VNT-015): 4 productos, total 86 (descuento 4 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-015', 'PRD-003', 3, 21),
('VNT-015', 'PRD-008', 2, 26),
('VNT-015', 'PRD-012', 2, 22),
('VNT-015', 'PRD-019', 1, 17);

-- Venta 16 (VNT-016): 3 productos, total 55
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-016', 'PRD-006', 2, 16),
('VNT-016', 'PRD-015', 1, 13),
('VNT-016', 'PRD-022', 1, 26);

-- Venta 17 (VNT-017): 5 productos, total 152 (descuento 10 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-017', 'PRD-002', 4, 28),
('VNT-017', 'PRD-009', 2, 38),
('VNT-017', 'PRD-013', 2, 20),
('VNT-017', 'PRD-016', 2, 36),
('VNT-017', 'PRD-020', 2, 30);

-- Venta 18 (VNT-018): 4 productos, total 76
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-018', 'PRD-004', 2, 18),
('VNT-018', 'PRD-010', 1, 15),
('VNT-018', 'PRD-017', 1, 22),
('VNT-018', 'PRD-021', 1, 21);

-- Venta 19 (VNT-019): 5 productos, total 125 (descuento 7 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-019', 'PRD-001', 3, 21),
('VNT-019', 'PRD-005', 2, 16),
('VNT-019', 'PRD-011', 2, 18),
('VNT-019', 'PRD-014', 2, 28),
('VNT-019', 'PRD-023', 2, 42);

-- Venta 20 (VNT-020): 3 productos, total 49
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-020', 'PRD-007', 1, 12),
('VNT-020', 'PRD-018', 2, 26),
('VNT-020', 'PRD-003', 1, 11);

-- Venta 21 (VNT-021): 5 productos, total 135 (descuento 9 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-021', 'PRD-006', 3, 24),
('VNT-021', 'PRD-008', 2, 26),
('VNT-021', 'PRD-012', 2, 22),
('VNT-021', 'PRD-015', 2, 26),
('VNT-021', 'PRD-019', 2, 37);

-- Venta 22 (VNT-022): 3 productos, total 61
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-022', 'PRD-002', 2, 14),
('VNT-022', 'PRD-009', 1, 19),
('VNT-022', 'PRD-016', 1, 28);

-- Venta 23 (VNT-023): 4 productos, total 99 (descuento 5 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-023', 'PRD-004', 3, 27),
('VNT-023', 'PRD-010', 2, 30),
('VNT-023', 'PRD-013', 2, 20),
('VNT-023', 'PRD-022', 1, 22);

-- Venta 24 (VNT-024): 3 productos, total 39
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-024', 'PRD-001', 2, 14),
('VNT-024', 'PRD-011', 1, 12),
('VNT-024', 'PRD-017', 1, 13);

-- Venta 25 (VNT-025): 5 productos, total 178 (descuento 11 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-025', 'PRD-005', 3, 24),
('VNT-025', 'PRD-007', 3, 36),
('VNT-025', 'PRD-014', 2, 28),
('VNT-025', 'PRD-020', 3, 45),
('VNT-025', 'PRD-021', 2, 45);

-- Venta 26 (VNT-026): 3 productos, total 58
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-026', 'PRD-003', 2, 14),
('VNT-026', 'PRD-018', 1, 13),
('VNT-026', 'PRD-023', 1, 31);

-- Venta 27 (VNT-027): 4 productos, total 109 (descuento 6 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-027', 'PRD-006', 2, 16),
('VNT-027', 'PRD-008', 3, 39),
('VNT-027', 'PRD-012', 2, 22),
('VNT-027', 'PRD-015', 2, 32);

-- Venta 28 (VNT-028): 4 productos, total 72
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-028', 'PRD-002', 3, 21),
('VNT-028', 'PRD-009', 1, 19),
('VNT-028', 'PRD-013', 2, 20),
('VNT-028', 'PRD-019', 1, 12);

-- Venta 29 (VNT-029): 5 productos, total 191 (descuento 13 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-029', 'PRD-004', 4, 36),
('VNT-029', 'PRD-010', 2, 30),
('VNT-029', 'PRD-016', 2, 36),
('VNT-029', 'PRD-022', 2, 44),
('VNT-029', 'PRD-021', 2, 45);

-- Venta 30 (VNT-030): 4 productos, total 84
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-030', 'PRD-001', 3, 21),
('VNT-030', 'PRD-007', 2, 24),
('VNT-030', 'PRD-011', 2, 18),
('VNT-030', 'PRD-017', 1, 21);

-- Venta 31 (VNT-031): 5 productos, total 145 (descuento 8 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-031', 'PRD-003', 3, 21),
('VNT-031', 'PRD-005', 3, 24),
('VNT-031', 'PRD-014', 2, 28),
('VNT-031', 'PRD-018', 2, 26),
('VNT-031', 'PRD-020', 3, 46);

-- Venta 32 (VNT-032): 3 productos, total 46
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-032', 'PRD-006', 1, 8),
('VNT-032', 'PRD-012', 2, 22),
('VNT-032', 'PRD-023', 1, 16);

-- Venta 33 (VNT-033): 5 productos, total 207 (descuento 14 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-033', 'PRD-002', 4, 28),
('VNT-033', 'PRD-008', 3, 39),
('VNT-033', 'PRD-013', 3, 30),
('VNT-033', 'PRD-019', 3, 51),
('VNT-033', 'PRD-021', 3, 59);

-- Venta 34 (VNT-034): 4 productos, total 69
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-034', 'PRD-004', 2, 18),
('VNT-034', 'PRD-009', 1, 19),
('VNT-034', 'PRD-015', 1, 13),
('VNT-034', 'PRD-016', 1, 19);

-- Venta 35 (VNT-035): 5 productos, total 122 (descuento 7 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-035', 'PRD-001', 3, 21),
('VNT-035', 'PRD-010', 2, 30),
('VNT-035', 'PRD-011', 2, 18),
('VNT-035', 'PRD-017', 2, 44),
('VNT-035', 'PRD-022', 1, 18);

-- Venta 36 (VNT-036): 3 productos, total 53
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-036', 'PRD-005', 2, 16),
('VNT-036', 'PRD-007', 1, 12),
('VNT-036', 'PRD-020', 1, 25);

-- Venta 37 (VNT-037): 5 productos, total 159 (descuento 10 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-037', 'PRD-003', 4, 28),
('VNT-037', 'PRD-006', 3, 24),
('VNT-037', 'PRD-014', 2, 28),
('VNT-037', 'PRD-018', 3, 39),
('VNT-037', 'PRD-021', 2, 40);

-- Venta 38 (VNT-038): 4 productos, total 77
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-038', 'PRD-002', 2, 14),
('VNT-038', 'PRD-008', 2, 26),
('VNT-038', 'PRD-012', 1, 11),
('VNT-038', 'PRD-023', 1, 26);

-- Venta 39 (VNT-039): 5 productos, total 140 (descuento 9 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-039', 'PRD-004', 3, 27),
('VNT-039', 'PRD-009', 2, 38),
('VNT-039', 'PRD-013', 2, 20),
('VNT-039', 'PRD-015', 2, 26),
('VNT-039', 'PRD-019', 2, 29);

-- Venta 40 (VNT-040): 3 productos, total 64
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-040', 'PRD-001', 3, 21),
('VNT-040', 'PRD-010', 1, 15),
('VNT-040', 'PRD-016', 1, 28);

-- Venta 41 (VNT-041): 5 productos, total 217 (descuento 16 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-041', 'PRD-005', 4, 32),
('VNT-041', 'PRD-011', 3, 27),
('VNT-041', 'PRD-017', 3, 66),
('VNT-041', 'PRD-020', 3, 45),
('VNT-041', 'PRD-022', 2, 47);

-- Venta 42 (VNT-042): 4 productos, total 81
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-042', 'PRD-007', 2, 24),
('VNT-042', 'PRD-014', 1, 14),
('VNT-042', 'PRD-018', 2, 26),
('VNT-042', 'PRD-023', 1, 17);

-- Venta 43 (VNT-043): 5 productos, total 175 (descuento 11 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-043', 'PRD-003', 3, 21),
('VNT-043', 'PRD-006', 4, 32),
('VNT-043', 'PRD-012', 3, 33),
('VNT-043', 'PRD-021', 3, 75),
('VNT-043', 'PRD-015', 1, 14);

-- Venta 44 (VNT-044): 3 productos, total 47
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-044', 'PRD-002', 2, 14),
('VNT-044', 'PRD-008', 1, 13),
('VNT-044', 'PRD-019', 1, 20);

-- Venta 45 (VNT-045): 5 productos, total 184 (descuento 12 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-045', 'PRD-004', 4, 36),
('VNT-045', 'PRD-009', 2, 38),
('VNT-045', 'PRD-013', 3, 30),
('VNT-045', 'PRD-016', 2, 36),
('VNT-045', 'PRD-020', 2, 44);

-- Venta 46 (VNT-046): 3 productos, total 59
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-046', 'PRD-001', 2, 14),
('VNT-046', 'PRD-010', 1, 15),
('VNT-046', 'PRD-017', 1, 30);

-- Venta 47 (VNT-047): 4 productos, total 132 (descuento 8 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-047', 'PRD-005', 3, 24),
('VNT-047', 'PRD-007', 3, 36),
('VNT-047', 'PRD-011', 3, 27),
('VNT-047', 'PRD-022', 2, 45);

-- Venta 48 (VNT-048): 4 productos, total 73
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-048', 'PRD-003', 2, 14),
('VNT-048', 'PRD-014', 1, 14),
('VNT-048', 'PRD-018', 2, 26),
('VNT-048', 'PRD-012', 1, 19);

-- Venta 49 (VNT-049): 5 productos, total 203 (descuento 15 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-049', 'PRD-002', 4, 28),
('VNT-049', 'PRD-006', 4, 32),
('VNT-049', 'PRD-015', 3, 39),
('VNT-049', 'PRD-021', 4, 80),
('VNT-049', 'PRD-023', 2, 24);

-- Venta 50 (VNT-050): 4 productos, total 91
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-050', 'PRD-004', 2, 18),
('VNT-050', 'PRD-008', 2, 26),
('VNT-050', 'PRD-013', 2, 20),
('VNT-050', 'PRD-019', 2, 27);

-- Venta 51 (VNT-051): 5 productos, total 114 (descuento 6 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-051', 'PRD-001', 3, 21),
('VNT-051', 'PRD-009', 1, 19),
('VNT-051', 'PRD-010', 2, 30),
('VNT-051', 'PRD-016', 1, 18),
('VNT-051', 'PRD-020', 2, 26);

-- Venta 52 (VNT-052): 3 productos, total 56
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-052', 'PRD-005', 2, 16),
('VNT-052', 'PRD-011', 2, 18),
('VNT-052', 'PRD-017', 1, 22);

-- Inserciones para Ventas (Agosto 2025)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES
('VNT-053', 'EMP-001', 'CLI-001', '2025-08-01', 0, 52, 0),
('VNT-054', 'EMP-002', 'CLI-002', '2025-08-01', 7, 89, 0),
('VNT-055', 'EMP-003', 'CLI-003', '2025-08-02', 0, 68, 0),
('VNT-056', 'EMP-004', 'CLI-004', '2025-08-02', 10, 145, 0),
('VNT-057', 'EMP-001', 'CLI-005', '2025-08-03', 5, 78, 0),
('VNT-058', 'EMP-002', 'CLI-006', '2025-08-04', 0, 63, 0),
('VNT-059', 'EMP-003', 'CLI-007', '2025-08-04', 12, 167, 0),
('VNT-060', 'EMP-004', 'CLI-008', '2025-08-05', 0, 44, 0),
('VNT-061', 'EMP-001', 'CLI-009', '2025-08-06', 8, 121, 0),
('VNT-062', 'EMP-002', 'CLI-010', '2025-08-06', 0, 57, 0),
('VNT-063', 'EMP-003', 'CLI-011', '2025-08-07', 15, 193, 0),
('VNT-064', 'EMP-004', 'CLI-012', '2025-08-08', 0, 72, 0),
('VNT-065', 'EMP-001', 'CLI-013', '2025-08-08', 6, 98, 0),
('VNT-066', 'EMP-002', 'CLI-001', '2025-08-09', 0, 85, 0),
('VNT-067', 'EMP-003', 'CLI-002', '2025-08-10', 11, 156, 0),
('VNT-068', 'EMP-004', 'CLI-003', '2025-08-10', 0, 49, 0),
('VNT-069', 'EMP-001', 'CLI-004', '2025-08-11', 9, 132, 0),
('VNT-070', 'EMP-002', 'CLI-005', '2025-08-12', 0, 66, 0),
('VNT-071', 'EMP-003', 'CLI-006', '2025-08-12', 14, 178, 0),
('VNT-072', 'EMP-004', 'CLI-007', '2025-08-13', 0, 54, 0),
('VNT-073', 'EMP-001', 'CLI-008', '2025-08-14', 7, 114, 0),
('VNT-074', 'EMP-002', 'CLI-009', '2025-08-14', 0, 81, 0),
('VNT-075', 'EMP-003', 'CLI-010', '2025-08-15', 13, 184, 0),
('VNT-076', 'EMP-004', 'CLI-011', '2025-08-16', 0, 59, 0),
('VNT-077', 'EMP-001', 'CLI-012', '2025-08-16', 10, 149, 0),
('VNT-078', 'EMP-002', 'CLI-013', '2025-08-17', 0, 73, 0),
('VNT-079', 'EMP-003', 'CLI-001', '2025-08-18', 16, 201, 0),
('VNT-080', 'EMP-004', 'CLI-002', '2025-08-18', 0, 47, 0),
('VNT-081', 'EMP-001', 'CLI-003', '2025-08-19', 8, 126, 0),
('VNT-082', 'EMP-002', 'CLI-004', '2025-08-20', 0, 92, 0),
('VNT-083', 'EMP-003', 'CLI-005', '2025-08-20', 12, 171, 0),
('VNT-084', 'EMP-004', 'CLI-006', '2025-08-21', 0, 61, 0),
('VNT-085', 'EMP-001', 'CLI-007', '2025-08-22', 9, 138, 0),
('VNT-086', 'EMP-002', 'CLI-008', '2025-08-22', 0, 76, 0),
('VNT-087', 'EMP-003', 'CLI-009', '2025-08-23', 15, 196, 0),
('VNT-088', 'EMP-004', 'CLI-010', '2025-08-24', 0, 55, 0),
('VNT-089', 'EMP-001', 'CLI-011', '2025-08-24', 11, 162, 0),
('VNT-090', 'EMP-002', 'CLI-012', '2025-08-25', 0, 69, 0),
('VNT-091', 'EMP-003', 'CLI-013', '2025-08-26', 14, 187, 0),
('VNT-092', 'EMP-004', 'CLI-001', '2025-08-26', 0, 83, 0);

-- Inserciones para DetalleVenta

-- Venta 53 (VNT-053): 3 productos, total 52
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-053', 'PRD-001', 2, 14),
('VNT-053', 'PRD-005', 2, 16),
('VNT-053', 'PRD-009', 1, 22);

-- Venta 54 (VNT-054): 4 productos, total 96 (descuento 7 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-054', 'PRD-003', 3, 21),
('VNT-054', 'PRD-007', 2, 24),
('VNT-054', 'PRD-011', 2, 18),
('VNT-054', 'PRD-015', 2, 33);

-- Venta 55 (VNT-055): 4 productos, total 68
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-055', 'PRD-002', 2, 14),
('VNT-055', 'PRD-008', 1, 13),
('VNT-055', 'PRD-012', 2, 22),
('VNT-055', 'PRD-016', 1, 19);

-- Venta 56 (VNT-056): 5 productos, total 155 (descuento 10 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-056', 'PRD-004', 3, 27),
('VNT-056', 'PRD-006', 2, 16),
('VNT-056', 'PRD-010', 2, 30),
('VNT-056', 'PRD-014', 2, 28),
('VNT-056', 'PRD-020', 3, 54);

-- Venta 57 (VNT-057): 4 productos, total 83 (descuento 5 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-057', 'PRD-001', 3, 21),
('VNT-057', 'PRD-009', 1, 19),
('VNT-057', 'PRD-013', 2, 20),
('VNT-057', 'PRD-017', 1, 23);

-- Venta 58 (VNT-058): 3 productos, total 63
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-058', 'PRD-005', 2, 16),
('VNT-058', 'PRD-011', 2, 18),
('VNT-058', 'PRD-018', 2, 29);

-- Venta 59 (VNT-059): 5 productos, total 179 (descuento 12 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-059', 'PRD-003', 3, 21),
('VNT-059', 'PRD-007', 3, 36),
('VNT-059', 'PRD-015', 2, 26),
('VNT-059', 'PRD-019', 2, 34),
('VNT-059', 'PRD-021', 3, 62);

-- Venta 60 (VNT-060): 3 productos, total 44
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-060', 'PRD-002', 2, 14),
('VNT-060', 'PRD-008', 1, 13),
('VNT-060', 'PRD-022', 1, 17);

-- Venta 61 (VNT-061): 5 productos, total 129 (descuento 8 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-061', 'PRD-004', 2, 18),
('VNT-061', 'PRD-006', 3, 24),
('VNT-061', 'PRD-010', 2, 30),
('VNT-061', 'PRD-012', 2, 22),
('VNT-061', 'PRD-016', 2, 35);

-- Venta 62 (VNT-062): 3 productos, total 57
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-062', 'PRD-001', 2, 14),
('VNT-062', 'PRD-013', 2, 20),
('VNT-062', 'PRD-023', 1, 23);

-- Venta 63 (VNT-063): 5 productos, total 208 (descuento 15 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-063', 'PRD-005', 4, 32),
('VNT-063', 'PRD-009', 2, 38),
('VNT-063', 'PRD-014', 3, 42),
('VNT-063', 'PRD-017', 2, 44),
('VNT-063', 'PRD-020', 3, 52);

-- Venta 64 (VNT-064): 4 productos, total 72
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-064', 'PRD-003', 2, 14),
('VNT-064', 'PRD-007', 2, 24),
('VNT-064', 'PRD-011', 2, 18),
('VNT-064', 'PRD-018', 1, 16);

-- Venta 65 (VNT-065): 5 productos, total 104 (descuento 6 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-065', 'PRD-002', 3, 21),
('VNT-065', 'PRD-008', 2, 26),
('VNT-065', 'PRD-015', 1, 13),
('VNT-065', 'PRD-019', 2, 34),
('VNT-065', 'PRD-022', 1, 10);

-- Venta 66 (VNT-066): 4 productos, total 85
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-066', 'PRD-004', 3, 27),
('VNT-066', 'PRD-010', 1, 15),
('VNT-066', 'PRD-012', 2, 22),
('VNT-066', 'PRD-021', 1, 21);

-- Venta 67 (VNT-067): 5 productos, total 167 (descuento 11 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-067', 'PRD-001', 3, 21),
('VNT-067', 'PRD-006', 3, 24),
('VNT-067', 'PRD-013', 3, 30),
('VNT-067', 'PRD-016', 2, 36),
('VNT-067', 'PRD-023', 2, 56);

-- Venta 68 (VNT-068): 3 productos, total 49
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-068', 'PRD-005', 1, 8),
('VNT-068', 'PRD-009', 1, 19),
('VNT-068', 'PRD-017', 1, 22);

-- Venta 69 (VNT-069): 5 productos, total 141 (descuento 9 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-069', 'PRD-003', 3, 21),
('VNT-069', 'PRD-007', 2, 24),
('VNT-069', 'PRD-011', 3, 27),
('VNT-069', 'PRD-014', 2, 28),
('VNT-069', 'PRD-018', 3, 41);

-- Venta 70 (VNT-070): 4 productos, total 66
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-070', 'PRD-002', 2, 14),
('VNT-070', 'PRD-008', 1, 13),
('VNT-070', 'PRD-015', 2, 26),
('VNT-070', 'PRD-019', 1, 13);

-- Venta 71 (VNT-071): 5 productos, total 192 (descuento 14 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-071', 'PRD-004', 4, 36),
('VNT-071', 'PRD-010', 2, 30),
('VNT-071', 'PRD-012', 3, 33),
('VNT-071', 'PRD-020', 3, 45),
('VNT-071', 'PRD-021', 2, 48);

-- Venta 72 (VNT-072): 3 productos, total 54
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-072', 'PRD-001', 2, 14),
('VNT-072', 'PRD-006', 2, 16),
('VNT-072', 'PRD-022', 1, 24);

-- Venta 73 (VNT-073): 5 productos, total 121 (descuento 7 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-073', 'PRD-005', 3, 24),
('VNT-073', 'PRD-009', 1, 19),
('VNT-073', 'PRD-013', 2, 20),
('VNT-073', 'PRD-016', 2, 36),
('VNT-073', 'PRD-023', 1, 22);

-- Venta 74 (VNT-074): 4 productos, total 81
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-074', 'PRD-003', 3, 21),
('VNT-074', 'PRD-007', 1, 12),
('VNT-074', 'PRD-011', 2, 18),
('VNT-074', 'PRD-017', 2, 30);

-- Venta 75 (VNT-075): 5 productos, total 197 (descuento 13 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-075', 'PRD-002', 4, 28),
('VNT-075', 'PRD-008', 3, 39),
('VNT-075', 'PRD-014', 2, 28),
('VNT-075', 'PRD-018', 3, 39),
('VNT-075', 'PRD-021', 3, 63);

-- Venta 76 (VNT-076): 3 productos, total 59
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-076', 'PRD-004', 2, 18),
('VNT-076', 'PRD-012', 2, 22),
('VNT-076', 'PRD-015', 1, 19);

-- Venta 77 (VNT-077): 5 productos, total 159 (descuento 10 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-077', 'PRD-001', 4, 28),
('VNT-077', 'PRD-006', 3, 24),
('VNT-077', 'PRD-010', 2, 30),
('VNT-077', 'PRD-019', 2, 34),
('VNT-077', 'PRD-020', 2, 43);

-- Venta 78 (VNT-078): 4 productos, total 73
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-078', 'PRD-005', 2, 16),
('VNT-078', 'PRD-009', 1, 19),
('VNT-078', 'PRD-013', 2, 20),
('VNT-078', 'PRD-022', 1, 18);

-- Venta 79 (VNT-079): 5 productos, total 217 (descuento 16 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-079', 'PRD-003', 4, 28),
('VNT-079', 'PRD-007', 3, 36),
('VNT-079', 'PRD-011', 3, 27),
('VNT-079', 'PRD-016', 3, 54),
('VNT-079', 'PRD-021', 4, 72);

-- Venta 80 (VNT-080): 3 productos, total 47
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-080', 'PRD-002', 2, 14),
('VNT-080', 'PRD-014', 1, 14),
('VNT-080', 'PRD-017', 1, 19);

-- Venta 81 (VNT-081): 5 productos, total 134 (descuento 8 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-081', 'PRD-004', 3, 27),
('VNT-081', 'PRD-008', 2, 26),
('VNT-081', 'PRD-012', 2, 22),
('VNT-081', 'PRD-015', 2, 26),
('VNT-081', 'PRD-018', 2, 33);

-- Venta 82 (VNT-082): 4 productos, total 92
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-082', 'PRD-001', 3, 21),
('VNT-082', 'PRD-010', 2, 30),
('VNT-082', 'PRD-019', 2, 34),
('VNT-082', 'PRD-023', 1, 7);

-- Venta 83 (VNT-083): 5 productos, total 183 (descuento 12 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-083', 'PRD-005', 4, 32),
('VNT-083', 'PRD-006', 3, 24),
('VNT-083', 'PRD-013', 3, 30),
('VNT-083', 'PRD-020', 3, 45),
('VNT-083', 'PRD-022', 2, 52);

-- Venta 84 (VNT-084): 3 productos, total 61
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-084', 'PRD-003', 2, 14),
('VNT-084', 'PRD-009', 1, 19),
('VNT-084', 'PRD-016', 2, 28);

-- Venta 85 (VNT-085): 5 productos, total 147 (descuento 9 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-085', 'PRD-007', 3, 36),
('VNT-085', 'PRD-011', 2, 18),
('VNT-085', 'PRD-014', 2, 28),
('VNT-085', 'PRD-017', 2, 44),
('VNT-085', 'PRD-021', 1, 21);

-- Venta 86 (VNT-086): 4 productos, total 76
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-086', 'PRD-002', 3, 21),
('VNT-086', 'PRD-008', 2, 26),
('VNT-086', 'PRD-012', 1, 11),
('VNT-086', 'PRD-018', 1, 18);

-- Venta 87 (VNT-087): 5 productos, total 211 (descuento 15 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-087', 'PRD-004', 4, 36),
('VNT-087', 'PRD-010', 3, 45),
('VNT-087', 'PRD-015', 3, 39),
('VNT-087', 'PRD-019', 3, 51),
('VNT-087', 'PRD-023', 2, 40);

-- Venta 88 (VNT-088): 3 productos, total 55
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-088', 'PRD-001', 2, 14),
('VNT-088', 'PRD-006', 2, 16),
('VNT-088', 'PRD-020', 1, 25);

-- Venta 89 (VNT-089): 5 productos, total 173 (descuento 11 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-089', 'PRD-005', 3, 24),
('VNT-089', 'PRD-009', 2, 38),
('VNT-089', 'PRD-013', 3, 30),
('VNT-089', 'PRD-016', 2, 36),
('VNT-089', 'PRD-022', 2, 45);

-- Venta 90 (VNT-090): 4 productos, total 69
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-090', 'PRD-003', 2, 14),
('VNT-090', 'PRD-007', 2, 24),
('VNT-090', 'PRD-011', 2, 18),
('VNT-090', 'PRD-017', 1, 13);

-- Venta 91 (VNT-091): 5 productos, total 201 (descuento 14 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-091', 'PRD-002', 4, 28),
('VNT-091', 'PRD-008', 3, 39),
('VNT-091', 'PRD-014', 3, 42),
('VNT-091', 'PRD-018', 3, 39),
('VNT-091', 'PRD-021', 3, 53);

-- Venta 92 (VNT-092): 4 productos, total 83
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-092', 'PRD-004', 2, 18),
('VNT-092', 'PRD-010', 2, 30),
('VNT-092', 'PRD-012', 2, 22),
('VNT-092', 'PRD-015', 1, 13);

-- Inserciones para Ventas (Septiembre 2025)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES
('VNT-093', 'EMP-001', 'CLI-002', '2025-09-01', 0, 58, 0),
('VNT-094', 'EMP-002', 'CLI-003', '2025-09-01', 9, 127, 0),
('VNT-095', 'EMP-003', 'CLI-004', '2025-09-02', 0, 74, 0),
('VNT-096', 'EMP-004', 'CLI-005', '2025-09-02', 12, 168, 0),
('VNT-097', 'EMP-001', 'CLI-006', '2025-09-03', 6, 95, 0),
('VNT-098', 'EMP-002', 'CLI-007', '2025-09-03', 0, 51, 0),
('VNT-099', 'EMP-003', 'CLI-008', '2025-09-04', 14, 189, 0),
('VNT-100', 'EMP-004', 'CLI-009', '2025-09-04', 0, 67, 0),
('VNT-101', 'EMP-001', 'CLI-010', '2025-09-05', 8, 119, 0),
('VNT-102', 'EMP-002', 'CLI-011', '2025-09-05', 0, 82, 0),
('VNT-103', 'EMP-003', 'CLI-012', '2025-09-06', 15, 194, 0),
('VNT-104', 'EMP-004', 'CLI-013', '2025-09-06', 0, 46, 0),
('VNT-105', 'EMP-001', 'CLI-001', '2025-09-07', 10, 143, 0),
('VNT-106', 'EMP-002', 'CLI-002', '2025-09-08', 0, 71, 0),
('VNT-107', 'EMP-003', 'CLI-003', '2025-09-08', 11, 159, 0),
('VNT-108', 'EMP-004', 'CLI-004', '2025-09-09', 0, 89, 0),
('VNT-109', 'EMP-001', 'CLI-005', '2025-09-09', 7, 108, 0),
('VNT-110', 'EMP-002', 'CLI-006', '2025-09-10', 0, 63, 0),
('VNT-111', 'EMP-003', 'CLI-007', '2025-09-10', 13, 176, 0),
('VNT-112', 'EMP-004', 'CLI-008', '2025-09-11', 0, 54, 0),
('VNT-113', 'EMP-001', 'CLI-009', '2025-09-12', 9, 134, 0),
('VNT-114', 'EMP-002', 'CLI-010', '2025-09-12', 0, 78, 0),
('VNT-115', 'EMP-003', 'CLI-011', '2025-09-13', 16, 203, 0),
('VNT-116', 'EMP-004', 'CLI-012', '2025-09-13', 0, 49, 0),
('VNT-117', 'EMP-001', 'CLI-013', '2025-09-14', 8, 121, 0),
('VNT-118', 'EMP-002', 'CLI-001', '2025-09-15', 0, 86, 0),
('VNT-119', 'EMP-003', 'CLI-002', '2025-09-15', 12, 165, 0),
('VNT-120', 'EMP-004', 'CLI-003', '2025-09-16', 0, 59, 0),
('VNT-121', 'EMP-001', 'CLI-004', '2025-09-16', 10, 148, 0),
('VNT-122', 'EMP-002', 'CLI-005', '2025-09-17', 0, 73, 0),
('VNT-123', 'EMP-003', 'CLI-006', '2025-09-18', 14, 181, 0),
('VNT-124', 'EMP-004', 'CLI-007', '2025-09-18', 0, 65, 0),
('VNT-125', 'EMP-001', 'CLI-008', '2025-09-19', 11, 156, 0),
('VNT-126', 'EMP-002', 'CLI-009', '2025-09-19', 0, 92, 0),
('VNT-127', 'EMP-003', 'CLI-010', '2025-09-20', 15, 198, 0),
('VNT-128', 'EMP-004', 'CLI-011', '2025-09-21', 0, 56, 0),
('VNT-129', 'EMP-001', 'CLI-012', '2025-09-21', 9, 139, 0),
('VNT-130', 'EMP-002', 'CLI-013', '2025-09-22', 0, 81, 0),
('VNT-131', 'EMP-003', 'CLI-001', '2025-09-22', 13, 172, 0),
('VNT-132', 'EMP-004', 'CLI-002', '2025-09-23', 0, 68, 0),
('VNT-133', 'EMP-001', 'CLI-003', '2025-09-24', 10, 151, 0),
('VNT-134', 'EMP-002', 'CLI-004', '2025-09-24', 0, 76, 0),
('VNT-135', 'EMP-003', 'CLI-005', '2025-09-25', 16, 206, 0),
('VNT-136', 'EMP-004', 'CLI-006', '2025-09-26', 0, 62, 0),
('VNT-137', 'EMP-001', 'CLI-007', '2025-09-26', 11, 163, 0);

-- Inserciones para DetalleVenta

-- Venta 93 (VNT-093): 3 productos, total 58
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-093', 'PRD-002', 2, 14),
('VNT-093', 'PRD-007', 1, 12),
('VNT-093', 'PRD-013', 2, 32);

-- Venta 94 (VNT-094): 5 productos, total 136 (descuento 9 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-094', 'PRD-001', 3, 21),
('VNT-094', 'PRD-005', 2, 16),
('VNT-094', 'PRD-009', 1, 19),
('VNT-094', 'PRD-015', 2, 26),
('VNT-094', 'PRD-020', 3, 54);

-- Venta 95 (VNT-095): 4 productos, total 74
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-095', 'PRD-003', 2, 14),
('VNT-095', 'PRD-010', 1, 15),
('VNT-095', 'PRD-016', 2, 36),
('VNT-095', 'PRD-022', 1, 9);

-- Venta 96 (VNT-096): 5 productos, total 180 (descuento 12 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-096', 'PRD-004', 3, 27),
('VNT-096', 'PRD-006', 3, 24),
('VNT-096', 'PRD-011', 3, 27),
('VNT-096', 'PRD-017', 2, 44),
('VNT-096', 'PRD-021', 3, 58);

-- Venta 97 (VNT-097): 4 productos, total 101 (descuento 6 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-097', 'PRD-002', 3, 21),
('VNT-097', 'PRD-008', 2, 26),
('VNT-097', 'PRD-012', 2, 22),
('VNT-097', 'PRD-018', 2, 32);

-- Venta 98 (VNT-098): 3 productos, total 51
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-098', 'PRD-001', 2, 14),
('VNT-098', 'PRD-014', 1, 14),
('VNT-098', 'PRD-023', 1, 23);

-- Venta 99 (VNT-099): 5 productos, total 203 (descuento 14 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-099', 'PRD-005', 4, 32),
('VNT-099', 'PRD-007', 3, 36),
('VNT-099', 'PRD-013', 3, 30),
('VNT-099', 'PRD-019', 3, 51),
('VNT-099', 'PRD-020', 3, 54);

-- Venta 100 (VNT-100): 4 productos, total 67
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-100', 'PRD-003', 2, 14),
('VNT-100', 'PRD-009', 1, 19),
('VNT-100', 'PRD-015', 1, 13),
('VNT-100', 'PRD-021', 1, 21);

-- Venta 101 (VNT-101): 5 productos, total 127 (descuento 8 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-101', 'PRD-004', 2, 18),
('VNT-101', 'PRD-006', 2, 16),
('VNT-101', 'PRD-010', 2, 30),
('VNT-101', 'PRD-016', 2, 36),
('VNT-101', 'PRD-022', 1, 27);

-- Venta 102 (VNT-102): 4 productos, total 82
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-102', 'PRD-002', 3, 21),
('VNT-102', 'PRD-008', 2, 26),
('VNT-102', 'PRD-011', 2, 18),
('VNT-102', 'PRD-017', 1, 17);

-- Venta 103 (VNT-103): 5 productos, total 209 (descuento 15 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-103', 'PRD-001', 4, 28),
('VNT-103', 'PRD-012', 3, 33),
('VNT-103', 'PRD-014', 3, 42),
('VNT-103', 'PRD-018', 3, 39),
('VNT-103', 'PRD-023', 3, 67);

-- Venta 104 (VNT-104): 3 productos, total 46
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-104', 'PRD-005', 1, 8),
('VNT-104', 'PRD-013', 2, 20),
('VNT-104', 'PRD-019', 1, 18);

-- Venta 105 (VNT-105): 5 productos, total 153 (descuento 10 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-105', 'PRD-003', 3, 21),
('VNT-105', 'PRD-007', 3, 36),
('VNT-105', 'PRD-009', 2, 38),
('VNT-105', 'PRD-015', 2, 26),
('VNT-105', 'PRD-020', 2, 32);

-- Venta 106 (VNT-106): 4 productos, total 71
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-106', 'PRD-004', 2, 18),
('VNT-106', 'PRD-010', 1, 15),
('VNT-106', 'PRD-016', 1, 18),
('VNT-106', 'PRD-021', 1, 20);

-- Venta 107 (VNT-107): 5 productos, total 170 (descuento 11 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-107', 'PRD-002', 4, 28),
('VNT-107', 'PRD-006', 3, 24),
('VNT-107', 'PRD-011', 3, 27),
('VNT-107', 'PRD-017', 2, 44),
('VNT-107', 'PRD-022', 2, 47);

-- Venta 108 (VNT-108): 4 productos, total 89
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-108', 'PRD-001', 3, 21),
('VNT-108', 'PRD-008', 2, 26),
('VNT-108', 'PRD-012', 2, 22),
('VNT-108', 'PRD-023', 1, 20);

-- Venta 109 (VNT-109): 5 productos, total 115 (descuento 7 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-109', 'PRD-005', 2, 16),
('VNT-109', 'PRD-013', 2, 20),
('VNT-109', 'PRD-014', 2, 28),
('VNT-109', 'PRD-018', 2, 26),
('VNT-109', 'PRD-019', 2, 25);

-- Venta 110 (VNT-110): 3 productos, total 63
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-110', 'PRD-003', 2, 14),
('VNT-110', 'PRD-009', 1, 19),
('VNT-110', 'PRD-020', 2, 30);

-- Venta 111 (VNT-111): 5 productos, total 189 (descuento 13 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-111', 'PRD-004', 4, 36),
('VNT-111', 'PRD-007', 3, 36),
('VNT-111', 'PRD-010', 2, 30),
('VNT-111', 'PRD-015', 3, 39),
('VNT-111', 'PRD-021', 2, 48);

-- Venta 112 (VNT-112): 3 productos, total 54
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-112', 'PRD-002', 2, 14),
('VNT-112', 'PRD-011', 2, 18),
('VNT-112', 'PRD-016', 1, 22);

-- Venta 113 (VNT-113): 5 productos, total 143 (descuento 9 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-113', 'PRD-001', 3, 21),
('VNT-113', 'PRD-006', 3, 24),
('VNT-113', 'PRD-012', 3, 33),
('VNT-113', 'PRD-017', 2, 44),
('VNT-113', 'PRD-022', 1, 21);

-- Venta 114 (VNT-114): 4 productos, total 78
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-114', 'PRD-005', 2, 16),
('VNT-114', 'PRD-008', 2, 26),
('VNT-114', 'PRD-013', 2, 20),
('VNT-114', 'PRD-018', 1, 16);

-- Venta 115 (VNT-115): 5 productos, total 219 (descuento 16 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-115', 'PRD-003', 4, 28),
('VNT-115', 'PRD-009', 3, 57),
('VNT-115', 'PRD-014', 3, 42),
('VNT-115', 'PRD-019', 3, 51),
('VNT-115', 'PRD-023', 2, 41);

-- Venta 116 (VNT-116): 3 productos, total 49
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-116', 'PRD-004', 2, 18),
('VNT-116', 'PRD-010', 1, 15),
('VNT-116', 'PRD-020', 1, 16);

-- Venta 117 (VNT-117): 5 productos, total 129 (descuento 8 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-117', 'PRD-002', 3, 21),
('VNT-117', 'PRD-007', 2, 24),
('VNT-117', 'PRD-011', 2, 18),
('VNT-117', 'PRD-015', 2, 26),
('VNT-117', 'PRD-021', 2, 40);

-- Venta 118 (VNT-118): 4 productos, total 86
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-118', 'PRD-001', 3, 21),
('VNT-118', 'PRD-006', 2, 16),
('VNT-118', 'PRD-016', 2, 36),
('VNT-118', 'PRD-022', 1, 13);

-- Venta 119 (VNT-119): 5 productos, total 177 (descuento 12 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-119', 'PRD-005', 3, 24),
('VNT-119', 'PRD-012', 3, 33),
('VNT-119', 'PRD-013', 3, 30),
('VNT-119', 'PRD-017', 3, 66),
('VNT-119', 'PRD-023', 1, 24);

-- Venta 120 (VNT-120): 3 productos, total 59
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-120', 'PRD-003', 2, 14),
('VNT-120', 'PRD-008', 1, 13),
('VNT-120', 'PRD-018', 2, 32);

-- Venta 121 (VNT-121): 5 productos, total 158 (descuento 10 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-121', 'PRD-004', 3, 27),
('VNT-121', 'PRD-009', 2, 38),
('VNT-121', 'PRD-010', 2, 30),
('VNT-121', 'PRD-014', 2, 28),
('VNT-121', 'PRD-019', 2, 35);

-- Venta 122 (VNT-122): 4 productos, total 73
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-122', 'PRD-002', 2, 14),
('VNT-122', 'PRD-007', 2, 24),
('VNT-122', 'PRD-015', 1, 13),
('VNT-122', 'PRD-020', 1, 22);

-- Venta 123 (VNT-123): 5 productos, total 195 (descuento 14 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-123', 'PRD-001', 4, 28),
('VNT-123', 'PRD-011', 3, 27),
('VNT-123', 'PRD-016', 3, 54),
('VNT-123', 'PRD-021', 3, 63),
('VNT-123', 'PRD-022', 1, 23);

-- Venta 124 (VNT-124): 3 productos, total 65
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-124', 'PRD-006', 2, 16),
('VNT-124', 'PRD-012', 2, 22),
('VNT-124', 'PRD-023', 1, 27);

-- Venta 125 (VNT-125): 5 productos, total 167 (descuento 11 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-125', 'PRD-005', 3, 24),
('VNT-125', 'PRD-008', 3, 39),
('VNT-125', 'PRD-013', 3, 30),
('VNT-125', 'PRD-017', 2, 44),
('VNT-125', 'PRD-018', 2, 30);

-- Venta 126 (VNT-126): 4 productos, total 92
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-126', 'PRD-003', 3, 21),
('VNT-126', 'PRD-009', 1, 19),
('VNT-126', 'PRD-014', 2, 28),
('VNT-126', 'PRD-019', 2, 24);

-- Venta 127 (VNT-127): 5 productos, total 213 (descuento 15 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-127', 'PRD-004', 4, 36),
('VNT-127', 'PRD-010', 3, 45),
('VNT-127', 'PRD-015', 3, 39),
('VNT-127', 'PRD-020', 3, 45),
('VNT-127', 'PRD-021', 2, 48);

-- Venta 128 (VNT-128): 3 productos, total 56
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-128', 'PRD-002', 2, 14),
('VNT-128', 'PRD-007', 1, 12),
('VNT-128', 'PRD-016', 2, 30);

-- Venta 129 (VNT-129): 5 productos, total 148 (descuento 9 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-129', 'PRD-001', 3, 21),
('VNT-129', 'PRD-006', 3, 24),
('VNT-129', 'PRD-011', 3, 27),
('VNT-129', 'PRD-022', 2, 46),
('VNT-129', 'PRD-023', 2, 30);

-- Venta 130 (VNT-130): 4 productos, total 81
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-130', 'PRD-005', 2, 16),
('VNT-130', 'PRD-012', 2, 22),
('VNT-130', 'PRD-013', 2, 20),
('VNT-130', 'PRD-017', 1, 23);

-- Venta 131 (VNT-131): 5 productos, total 185 (descuento 13 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-131', 'PRD-003', 4, 28),
('VNT-131', 'PRD-008', 3, 39),
('VNT-131', 'PRD-014', 3, 42),
('VNT-131', 'PRD-018', 3, 39),
('VNT-131', 'PRD-019', 2, 37);

-- Venta 132 (VNT-132): 4 productos, total 68
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-132', 'PRD-004', 2, 18),
('VNT-132', 'PRD-009', 1, 19),
('VNT-132', 'PRD-015', 1, 13),
('VNT-132', 'PRD-020', 1, 18);

-- Venta 133 (VNT-133): 5 productos, total 161 (descuento 10 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-133', 'PRD-002', 4, 28),
('VNT-133', 'PRD-010', 2, 30),
('VNT-133', 'PRD-016', 2, 36),
('VNT-133', 'PRD-021', 2, 42),
('VNT-133', 'PRD-023', 1, 25);

-- Venta 134 (VNT-134): 4 productos, total 76
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-134', 'PRD-001', 3, 21),
('VNT-134', 'PRD-007', 2, 24),
('VNT-134', 'PRD-011', 2, 18),
('VNT-134', 'PRD-022', 1, 13);

-- Venta 135 (VNT-135): 5 productos, total 222 (descuento 16 aplicado aparte)
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-135', 'PRD-006', 4, 32),
('VNT-135', 'PRD-012', 4, 44),
('VNT-135', 'PRD-013', 4, 40),
('VNT-135', 'PRD-017', 3, 66),
('VNT-135', 'PRD-018', 3, 40);

-- Venta 136 (VNT-136): 3 productos, total 62
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-136', 'PRD-005', 2, 16),
('VNT-136', 'PRD-014', 1, 14),
('VNT-136', 'PRD-019', 3, 15),
('VNT-136', 'PRD-012', 1, 8);

-- Venta 137 (VNT-137): 3 productos, total 62
INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-137', 'PRD-010', 1, 5),
('VNT-137', 'PRD-011', 4, 20),
('VNT-137', 'PRD-001', 3, 21);



-- Inserciones para Octubre y Noviembre

-- Venta VNT-138 (Total: 97 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-138', 'EMP-002', 'CLI-005', '2025-10-19', 10, 97, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-138', 'PRD-004', 1, 7),
('VNT-138', 'PRD-016', 3, 36),
('VNT-138', 'PRD-020', 3, 24),
('VNT-138', 'PRD-022', 1, 10),
('VNT-138', 'PRD-023', 2, 20);

-- Venta VNT-139 (Total: 46 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-139', 'EMP-003', 'CLI-006', '2025-10-14', 0, 46, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-139', 'PRD-006', 2, 12),
('VNT-139', 'PRD-021', 1, 9),
('VNT-139', 'PRD-005', 2, 14),
('VNT-139', 'PRD-017', 1, 11);

-- Venta VNT-140 (Total: 126 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-140', 'EMP-003', 'CLI-008', '2025-10-26', 15, 126, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-140', 'PRD-011', 3, 15),
('VNT-140', 'PRD-022', 3, 30),
('VNT-140', 'PRD-006', 2, 12),
('VNT-140', 'PRD-019', 3, 36),
('VNT-140', 'PRD-015', 3, 33);

-- Venta VNT-141 (Total: 59 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-141', 'EMP-004', 'CLI-005', '2025-10-23', 15, 59, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-141', 'PRD-004', 3, 21),
('VNT-141', 'PRD-016', 2, 24),
('VNT-141', 'PRD-011', 1, 5),
('VNT-141', 'PRD-021', 1, 9);

-- Venta VNT-142 (Total: 40 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-142', 'EMP-004', 'CLI-005', '2025-10-22', 15, 40, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-142', 'PRD-010', 2, 10),
('VNT-142', 'PRD-007', 1, 6),
('VNT-142', 'PRD-018', 1, 9),
('VNT-142', 'PRD-011', 3, 15);

-- Venta VNT-143 (Total: 49 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-143', 'EMP-002', 'CLI-010', '2025-10-24', 8, 49, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-143', 'PRD-013', 1, 10),
('VNT-143', 'PRD-006', 3, 18),
('VNT-143', 'PRD-001', 3, 21);

-- Venta VNT-144 (Total: 93 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-144', 'EMP-003', 'CLI-004', '2025-10-13', 12, 93, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-144', 'PRD-014', 3, 30),
('VNT-144', 'PRD-023', 3, 30),
('VNT-144', 'PRD-009', 3, 33);

-- Venta VNT-145 (Total: 116 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-145', 'EMP-004', 'CLI-006', '2025-10-26', 15, 116, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-145', 'PRD-014', 3, 30),
('VNT-145', 'PRD-021', 3, 27),
('VNT-145', 'PRD-004', 3, 21),
('VNT-145', 'PRD-018', 2, 18),
('VNT-145', 'PRD-022', 2, 20);

-- Venta VNT-146 (Total: 39 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-146', 'EMP-004', 'CLI-001', '2025-10-06', 15, 39, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-146', 'PRD-004', 1, 7),
('VNT-146', 'PRD-017', 1, 11),
('VNT-146', 'PRD-013', 1, 10),
('VNT-146', 'PRD-015', 1, 11);

-- Venta VNT-147 (Total: 41 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-147', 'EMP-001', 'CLI-0010', '2025-10-12', 8, 41, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-147', 'PRD-004', 2, 14),
('VNT-147', 'PRD-007', 1, 6),
('VNT-147', 'PRD-023', 1, 10),
('VNT-147', 'PRD-015', 1, 11);

-- Venta VNT-148 (Total: 42 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-148', 'EMP-003', 'CLI-001', '2025-10-01', 0, 42, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-148', 'PRD-011', 1, 5),
('VNT-148', 'PRD-008', 2, 22),
('VNT-148', 'PRD-010', 3, 15);

-- Venta VNT-149 (Total: 90 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-149', 'EMP-004', 'CLI-004', '2025-10-11', 0, 90, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-149', 'PRD-002', 3, 21),
('VNT-149', 'PRD-012', 3, 36),
('VNT-149', 'PRD-015', 2, 22),
('VNT-149', 'PRD-017', 1, 11);

-- Venta VNT-150 (Total: 49 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-150', 'EMP-003', 'CLI-005', '2025-10-20', 10, 49, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-150', 'PRD-005', 2, 14),
('VNT-150', 'PRD-013', 3, 30),
('VNT-150', 'PRD-011', 1, 5);

-- Venta VNT-151 (Total: 94 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-151', 'EMP-001', 'CLI-0011', '2025-10-04', 8, 94, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-151', 'PRD-008', 1, 11),
('VNT-151', 'PRD-007', 3, 18),
('VNT-151', 'PRD-015', 1, 11),
('VNT-151', 'PRD-022', 3, 30),
('VNT-151', 'PRD-020', 3, 24);

-- Venta VNT-152 (Total: 72 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-152', 'EMP-003', 'CLI-0013', '2025-10-29', 10, 72, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-152', 'PRD-013', 1, 10),
('VNT-152', 'PRD-008', 2, 22),
('VNT-152', 'PRD-012', 2, 24),
('VNT-152', 'PRD-020', 2, 16);

-- Venta VNT-153 (Total: 36 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-153', 'EMP-004', 'CLI-007', '2025-10-15', 3, 36, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-153', 'PRD-013', 1, 10),
('VNT-153', 'PRD-008', 1, 11),
('VNT-153', 'PRD-010', 3, 15);

-- Venta VNT-154 (Total: 61 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-154', 'EMP-003', 'CLI-007', '2025-10-27', 15, 61, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-154', 'PRD-004', 3, 21),
('VNT-154', 'PRD-011', 2, 10),
('VNT-154', 'PRD-021', 2, 18),
('VNT-154', 'PRD-007', 2, 12);

-- Venta VNT-155 (Total: 81 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-155', 'EMP-001', 'CLI-006', '2025-10-09', 0, 81, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-155', 'PRD-012', 2, 24),
('VNT-155', 'PRD-001', 3, 21),
('VNT-155', 'PRD-016', 3, 36);

-- Venta VNT-156 (Total: 73 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-156', 'EMP-002', 'CLI-0010', '2025-10-07', 15, 73, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-156', 'PRD-008', 1, 11),
('VNT-156', 'PRD-018', 3, 27),
('VNT-156', 'PRD-005', 3, 21),
('VNT-156', 'PRD-004', 2, 14);

-- Venta VNT-157 (Total: 95 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-157', 'EMP-002', 'CLI-005', '2025-10-06', 10, 95, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-157', 'PRD-023', 3, 30),
('VNT-157', 'PRD-012', 1, 12),
('VNT-157', 'PRD-020', 3, 24),
('VNT-157', 'PRD-013', 2, 20),
('VNT-157', 'PRD-018', 1, 9);

-- Venta VNT-158 (Total: 56 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-158', 'EMP-003', 'CLI-005', '2025-10-13', 15, 56, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-158', 'PRD-017', 3, 33),
('VNT-158', 'PRD-002', 1, 7),
('VNT-158', 'PRD-006', 1, 6),
('VNT-158', 'PRD-013', 1, 10);

-- Venta VNT-159 (Total: 47 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-159', 'EMP-001', 'CLI-005', '2025-10-30', 3, 47, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-159', 'PRD-005', 3, 21),
('VNT-159', 'PRD-002', 3, 21),
('VNT-159', 'PRD-011', 1, 5);

-- Venta VNT-160 (Total: 107 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-160', 'EMP-004', 'CLI-0013', '2025-10-21', 5, 107, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-160', 'PRD-023', 3, 30),
('VNT-160', 'PRD-018', 1, 9),
('VNT-160', 'PRD-021', 3, 27),
('VNT-160', 'PRD-008', 1, 11),
('VNT-160', 'PRD-013', 3, 30);

-- Venta VNT-161 (Total: 80 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-161', 'EMP-004', 'CLI-0012', '2025-10-29', 3, 80, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-161', 'PRD-015', 3, 33),
('VNT-161', 'PRD-011', 1, 5),
('VNT-161', 'PRD-014', 3, 30),
('VNT-161', 'PRD-016', 1, 12);

-- Venta VNT-162 (Total: 44 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-162', 'EMP-001', 'CLI-006', '2025-10-16', 15, 44, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-162', 'PRD-002', 2, 14),
('VNT-162', 'PRD-013', 3, 30);

-- Venta VNT-163 (Total: 64 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-163', 'EMP-003', 'CLI-0012', '2025-10-02', 3, 64, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-163', 'PRD-019', 1, 12),
('VNT-163', 'PRD-003', 2, 14),
('VNT-163', 'PRD-015', 2, 22),
('VNT-163', 'PRD-020', 2, 16);

-- Venta VNT-164 (Total: 113 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-164', 'EMP-003', 'CLI-003', '2025-10-03', 0, 113, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-164', 'PRD-005', 2, 14),
('VNT-164', 'PRD-008', 3, 33),
('VNT-164', 'PRD-013', 3, 30),
('VNT-164', 'PRD-012', 3, 36);

-- Venta VNT-165 (Total: 93 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-165', 'EMP-004', 'CLI-009', '2025-10-26', 3, 93, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-165', 'PRD-013', 3, 30),
('VNT-165', 'PRD-017', 1, 11),
('VNT-165', 'PRD-008', 3, 33),
('VNT-165', 'PRD-007', 2, 12),
('VNT-165', 'PRD-004', 1, 7);

-- Venta VNT-166 (Total: 27 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-166', 'EMP-001', 'CLI-008', '2025-10-18', 5, 27, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-166', 'PRD-023', 1, 10),
('VNT-166', 'PRD-004', 1, 7),
('VNT-166', 'PRD-013', 1, 10);

-- Venta VNT-167 (Total: 72 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-167', 'EMP-002', 'CLI-0012', '2025-10-04', 0, 72, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-167', 'PRD-011', 1, 5),
('VNT-167', 'PRD-016', 2, 24),
('VNT-167', 'PRD-004', 1, 7),
('VNT-167', 'PRD-019', 3, 36);

-- Venta VNT-168 (Total: 60 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-168', 'EMP-004', 'CLI-0010', '2025-10-07', 15, 60, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-168', 'PRD-023', 1, 10),
('VNT-168', 'PRD-017', 3, 33),
('VNT-168', 'PRD-006', 2, 12),
('VNT-168', 'PRD-010', 1, 5);

-- Venta VNT-169 (Total: 63 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-169', 'EMP-004', 'CLI-001', '2025-10-08', 5, 63, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-169', 'PRD-008', 1, 11),
('VNT-169', 'PRD-005', 1, 7),
('VNT-169', 'PRD-020', 3, 24),
('VNT-169', 'PRD-002', 3, 21);

-- Venta VNT-170 (Total: 50 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-170', 'EMP-002', 'CLI-003', '2025-10-22', 3, 50, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-170', 'PRD-008', 2, 22),
('VNT-170', 'PRD-023', 1, 10),
('VNT-170', 'PRD-006', 1, 6),
('VNT-170', 'PRD-007', 2, 12);

-- Venta VNT-171 (Total: 69 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-171', 'EMP-004', 'CLI-007', '2025-10-06', 12, 69, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-171', 'PRD-006', 3, 18),
('VNT-171', 'PRD-005', 1, 7),
('VNT-171', 'PRD-023', 1, 10),
('VNT-171', 'PRD-018', 3, 27),
('VNT-171', 'PRD-003', 1, 7);

-- Venta VNT-172 (Total: 95 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-172', 'EMP-004', 'CLI-0013', '2025-10-04', 15, 95, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-172', 'PRD-008', 3, 33),
('VNT-172', 'PRD-022', 2, 20),
('VNT-172', 'PRD-011', 2, 10),
('VNT-172', 'PRD-004', 2, 14),
('VNT-172', 'PRD-021', 2, 18);

-- Venta VNT-173 (Total: 84 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-173', 'EMP-004', 'CLI-002', '2025-10-11', 15, 84, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-173', 'PRD-021', 3, 27),
('VNT-173', 'PRD-012', 1, 12),
('VNT-173', 'PRD-007', 2, 12),
('VNT-173', 'PRD-017', 3, 33);

-- Venta VNT-174 (Total: 102 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-174', 'EMP-001', 'CLI-006', '2025-10-07', 0, 102, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-174', 'PRD-018', 3, 27),
('VNT-174', 'PRD-020', 3, 24),
('VNT-174', 'PRD-014', 3, 30),
('VNT-174', 'PRD-004', 3, 21);

-- Venta VNT-175 (Total: 48 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-175', 'EMP-004', 'CLI-004', '2025-10-20', 15, 48, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-175', 'PRD-013', 1, 10),
('VNT-175', 'PRD-007', 1, 6),
('VNT-175', 'PRD-008', 1, 11),
('VNT-175', 'PRD-004', 3, 21);

-- Venta VNT-176 (Total: 40 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-176', 'EMP-001', 'CLI-005', '2025-10-01', 10, 40, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-176', 'PRD-016', 2, 24),
('VNT-176', 'PRD-002', 1, 7),
('VNT-176', 'PRD-018', 1, 9);

-- Venta VNT-177 (Total: 60 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-177', 'EMP-003', 'CLI-0013', '2025-10-01', 15, 60, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-177', 'PRD-013', 2, 20),
('VNT-177', 'PRD-010', 2, 10),
('VNT-177', 'PRD-006', 1, 6),
('VNT-177', 'PRD-005', 2, 14),
('VNT-177', 'PRD-023', 1, 10);

-- Venta VNT-178 (Total: 53 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-178', 'EMP-002', 'CLI-003', '2025-10-09', 8, 53, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-178', 'PRD-020', 2, 16),
('VNT-178', 'PRD-013', 3, 30),
('VNT-178', 'PRD-005', 1, 7);

-- Venta VNT-179 (Total: 73 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-179', 'EMP-002', 'CLI-007', '2025-10-01', 15, 73, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-179', 'PRD-014', 1, 10),
('VNT-179', 'PRD-023', 3, 30),
('VNT-179', 'PRD-016', 1, 12),
('VNT-179', 'PRD-003', 3, 21);

-- Venta VNT-180 (Total: 86 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-180', 'EMP-003', 'CLI-002', '2025-10-30', 0, 86, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-180', 'PRD-018', 2, 18),
('VNT-180', 'PRD-001', 1, 7),
('VNT-180', 'PRD-015', 2, 22),
('VNT-180', 'PRD-021', 2, 18),
('VNT-180', 'PRD-002', 3, 21);

-- Venta VNT-181 (Total: 92 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-181', 'EMP-002', 'CLI-006', '2025-10-26', 12, 92, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-181', 'PRD-005', 3, 21),
('VNT-181', 'PRD-009', 3, 33),
('VNT-181', 'PRD-020', 3, 24),
('VNT-181', 'PRD-001', 2, 14);

-- Venta VNT-182 (Total: 28 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-182', 'EMP-004', 'CLI-001', '2025-10-10', 12, 28, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-182', 'PRD-023', 1, 10),
('VNT-182', 'PRD-003', 1, 7),
('VNT-182', 'PRD-009', 1, 11);

-- Venta VNT-183 (Total: 76 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-183', 'EMP-001', 'CLI-007', '2025-10-16', 12, 76, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-183', 'PRD-002', 2, 14),
('VNT-183', 'PRD-016', 1, 12),
('VNT-183', 'PRD-010', 2, 10),
('VNT-183', 'PRD-018', 2, 18),
('VNT-183', 'PRD-017', 2, 22);

-- Venta VNT-184 (Total: 94 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-184', 'EMP-003', 'CLI-0011', '2025-10-25', 3, 94, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-184', 'PRD-005', 3, 21),
('VNT-184', 'PRD-006', 3, 18),
('VNT-184', 'PRD-009', 2, 22),
('VNT-184', 'PRD-017', 3, 33);

-- Venta VNT-185 (Total: 105 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-185', 'EMP-004', 'CLI-009', '2025-10-16', 12, 105, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-185', 'PRD-023', 3, 30),
('VNT-185', 'PRD-020', 3, 24),
('VNT-185', 'PRD-013', 3, 30),
('VNT-185', 'PRD-005', 3, 21);

-- Venta VNT-186 (Total: 87 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-186', 'EMP-003', 'CLI-004', '2025-10-26', 10, 87, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-186', 'PRD-023', 1, 10),
('VNT-186', 'PRD-022', 1, 10),
('VNT-186', 'PRD-015', 3, 33),
('VNT-186', 'PRD-005', 2, 14),
('VNT-186', 'PRD-014', 2, 20);

-- Venta VNT-187 (Total: 91 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-187', 'EMP-002', 'CLI-004', '2025-10-10', 15, 91, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-187', 'PRD-017', 3, 33),
('VNT-187', 'PRD-004', 2, 14),
('VNT-187', 'PRD-013', 2, 20),
('VNT-187', 'PRD-012', 1, 12),
('VNT-187', 'PRD-019', 1, 12);

-- Venta VNT-188 (Total: 45 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-188', 'EMP-002', 'CLI-008', '2025-10-12', 8, 45, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-188', 'PRD-021', 1, 9),
('VNT-188', 'PRD-002', 2, 14),
('VNT-188', 'PRD-009', 1, 11),
('VNT-188', 'PRD-015', 1, 11);

-- Venta VNT-189 (Total: 67 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-189', 'EMP-003', 'CLI-007', '2025-10-31', 5, 67, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-189', 'PRD-013', 1, 10),
('VNT-189', 'PRD-023', 1, 10),
('VNT-189', 'PRD-001', 2, 14),
('VNT-189', 'PRD-008', 3, 33);

-- Venta VNT-190 (Total: 81 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-190', 'EMP-003', 'CLI-009', '2025-10-02', 0, 81, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-190', 'PRD-017', 3, 33),
('VNT-190', 'PRD-011', 2, 10),
('VNT-190', 'PRD-020', 2, 16),
('VNT-190', 'PRD-012', 1, 12),
('VNT-190', 'PRD-023', 1, 10);

-- Venta VNT-191 (Total: 56 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-191', 'EMP-002', 'CLI-001', '2025-10-28', 5, 56, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-191', 'PRD-001', 2, 14),
('VNT-191', 'PRD-017', 2, 22),
('VNT-191', 'PRD-022', 2, 20);

-- Venta VNT-192 (Total: 71 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-192', 'EMP-002', 'CLI-0011', '2025-10-04', 5, 71, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-192', 'PRD-020', 1, 8),
('VNT-192', 'PRD-021', 2, 18),
('VNT-192', 'PRD-015', 1, 11),
('VNT-192', 'PRD-001', 2, 14),
('VNT-192', 'PRD-022', 2, 20);

-- Venta VNT-193 (Total: 111 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-193', 'EMP-002', 'CLI-0012', '2025-10-09', 15, 111, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-193', 'PRD-002', 1, 7),
('VNT-193', 'PRD-001', 2, 14),
('VNT-193', 'PRD-021', 3, 27),
('VNT-193', 'PRD-014', 3, 30),
('VNT-193', 'PRD-015', 3, 33);

-- Venta VNT-194 (Total: 117 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-194', 'EMP-001', 'CLI-005', '2025-10-04', 5, 117, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-194', 'PRD-008', 3, 33),
('VNT-194', 'PRD-023', 2, 20),
('VNT-194', 'PRD-013', 1, 10),
('VNT-194', 'PRD-003', 3, 21),
('VNT-194', 'PRD-009', 3, 33);

-- Venta VNT-195 (Total: 12 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-195', 'EMP-004', 'CLI-0012', '2025-10-18', 12, 12, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-195', 'PRD-007', 2, 12);

-- Venta VNT-196 (Total: 110 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-196', 'EMP-004', 'CLI-005', '2025-10-09', 5, 110, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-196', 'PRD-018', 1, 9),
('VNT-196', 'PRD-008', 3, 33),
('VNT-196', 'PRD-007', 2, 12),
('VNT-196', 'PRD-013', 2, 20),
('VNT-196', 'PRD-012', 3, 36);

-- Venta VNT-197 (Total: 75 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-197', 'EMP-003', 'CLI-003', '2025-10-27', 15, 75, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-197', 'PRD-004', 3, 21),
('VNT-197', 'PRD-011', 2, 10),
('VNT-197', 'PRD-017', 3, 33),
('VNT-197', 'PRD-009', 1, 11);

-- Venta VNT-198 (Total: 76 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-198', 'EMP-004', 'CLI-006', '2025-10-05', 8, 76, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-198', 'PRD-004', 1, 7),
('VNT-198', 'PRD-007', 2, 12),
('VNT-198', 'PRD-002', 1, 7),
('VNT-198', 'PRD-022', 2, 20),
('VNT-198', 'PRD-014', 3, 30);

-- Venta VNT-199 (Total: 89 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-199', 'EMP-004', 'CLI-0010', '2025-10-20', 8, 89, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-199', 'PRD-012', 3, 36),
('VNT-199', 'PRD-007', 2, 12),
('VNT-199', 'PRD-022', 2, 20),
('VNT-199', 'PRD-005', 3, 21);

-- Venta VNT-200 (Total: 45 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-200', 'EMP-001', 'CLI-003', '2025-10-02', 5, 45, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-200', 'PRD-020', 2, 16),
('VNT-200', 'PRD-011', 1, 5),
('VNT-200', 'PRD-016', 2, 24);

-- Venta VNT-201 (Total: 126 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-201', 'EMP-002', 'CLI-006', '2025-10-29', 12, 126, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-201', 'PRD-009', 3, 33),
('VNT-201', 'PRD-005', 3, 21),
('VNT-201', 'PRD-008', 2, 22),
('VNT-201', 'PRD-013', 3, 30),
('VNT-201', 'PRD-014', 2, 20);

-- Venta VNT-202 (Total: 53 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-202', 'EMP-003', 'CLI-009', '2025-10-22', 15, 53, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-202', 'PRD-020', 1, 8),
('VNT-202', 'PRD-017', 1, 11),
('VNT-202', 'PRD-015', 2, 22),
('VNT-202', 'PRD-007', 2, 12);

-- Venta VNT-203 (Total: 66 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-203', 'EMP-002', 'CLI-005', '2025-10-06', 8, 66, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-203', 'PRD-017', 2, 22),
('VNT-203', 'PRD-006', 3, 18),
('VNT-203', 'PRD-004', 2, 14),
('VNT-203', 'PRD-012', 1, 12);

-- Venta VNT-204 (Total: 66 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-204', 'EMP-003', 'CLI-0010', '2025-10-15', 8, 66, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-204', 'PRD-003', 3, 21),
('VNT-204', 'PRD-007', 3, 18),
('VNT-204', 'PRD-011', 1, 5),
('VNT-204', 'PRD-008', 2, 22);

-- Venta VNT-205 (Total: 111 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-205', 'EMP-002', 'CLI-0011', '2025-10-31', 8, 111, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-205', 'PRD-023', 3, 30),
('VNT-205', 'PRD-022', 3, 30),
('VNT-205', 'PRD-003', 3, 21),
('VNT-205', 'PRD-014', 3, 30);

-- Venta VNT-206 (Total: 61 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-206', 'EMP-001', 'CLI-004', '2025-10-26', 15, 61, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-206', 'PRD-019', 3, 36),
('VNT-206', 'PRD-010', 2, 10),
('VNT-206', 'PRD-022', 1, 10),
('VNT-206', 'PRD-011', 1, 5);

-- Venta VNT-207 (Total: 62 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-207', 'EMP-004', 'CLI-0010', '2025-10-16', 0, 62, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-207', 'PRD-014', 3, 30),
('VNT-207', 'PRD-007', 3, 18),
('VNT-207', 'PRD-004', 2, 14);

-- Venta VNT-208 (Total: 74 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-208', 'EMP-001', 'CLI-001', '2025-10-26', 5, 74, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-208', 'PRD-010', 1, 5),
('VNT-208', 'PRD-018', 2, 18),
('VNT-208', 'PRD-005', 3, 21),
('VNT-208', 'PRD-016', 1, 12),
('VNT-208', 'PRD-006', 3, 18);

-- Venta VNT-209 (Total: 51 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-209', 'EMP-001', 'CLI-0013', '2025-10-31', 8, 51, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-209', 'PRD-010', 1, 5),
('VNT-209', 'PRD-011', 2, 10),
('VNT-209', 'PRD-020', 2, 16),
('VNT-209', 'PRD-023', 2, 20);

-- Venta VNT-210 (Total: 53 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-210', 'EMP-001', 'CLI-007', '2025-10-16', 5, 53, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-210', 'PRD-004', 3, 21),
('VNT-210', 'PRD-022', 1, 10),
('VNT-210', 'PRD-008', 2, 22);

-- Venta VNT-211 (Total: 107 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-211', 'EMP-002', 'CLI-0012', '2025-10-17', 0, 107, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-211', 'PRD-012', 3, 36),
('VNT-211', 'PRD-006', 2, 12),
('VNT-211', 'PRD-022', 2, 20),
('VNT-211', 'PRD-023', 3, 30),
('VNT-211', 'PRD-021', 1, 9);

-- Venta VNT-212 (Total: 36 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-212', 'EMP-004', 'CLI-002', '2025-10-01', 15, 36, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-212', 'PRD-020', 3, 24),
('VNT-212', 'PRD-011', 1, 5),
('VNT-212', 'PRD-005', 1, 7);

-- Venta VNT-213 (Total: 71 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-213', 'EMP-002', 'CLI-007', '2025-10-23', 3, 71, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-213', 'PRD-021', 3, 27),
('VNT-213', 'PRD-016', 2, 24),
('VNT-213', 'PRD-011', 2, 10),
('VNT-213', 'PRD-022', 1, 10);

-- Venta VNT-214 (Total: 40 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-214', 'EMP-003', 'CLI-006', '2025-10-07', 15, 40, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-214', 'PRD-003', 1, 7),
('VNT-214', 'PRD-015', 1, 11),
('VNT-214', 'PRD-017', 2, 22);

-- Venta VNT-215 (Total: 60 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-215', 'EMP-004', 'CLI-0010', '2025-10-25', 0, 60, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-215', 'PRD-004', 2, 14),
('VNT-215', 'PRD-012', 2, 24),
('VNT-215', 'PRD-019', 1, 12),
('VNT-215', 'PRD-022', 1, 10);

-- Venta VNT-216 (Total: 32 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-216', 'EMP-003', 'CLI-001', '2025-10-06', 5, 32, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-216', 'PRD-009', 1, 11),
('VNT-216', 'PRD-005', 3, 21);

-- Venta VNT-217 (Total: 47 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-217', 'EMP-003', 'CLI-002', '2025-10-21', 3, 47, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-217', 'PRD-004', 2, 14),
('VNT-217', 'PRD-010', 3, 15),
('VNT-217', 'PRD-007', 2, 12),
('VNT-217', 'PRD-006', 1, 6);

-- Venta VNT-218 (Total: 26 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-218', 'EMP-002', 'CLI-0013', '2025-10-15', 15, 26, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-218', 'PRD-022', 1, 10),
('VNT-218', 'PRD-010', 1, 5),
('VNT-218', 'PRD-017', 1, 11);

-- Venta VNT-219 (Total: 48 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-219', 'EMP-001', 'CLI-0011', '2025-10-26', 12, 48, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-219', 'PRD-018', 2, 18),
('VNT-219', 'PRD-011', 1, 5),
('VNT-219', 'PRD-004', 1, 7),
('VNT-219', 'PRD-021', 2, 18);

-- Venta VNT-220 (Total: 68 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-220', 'EMP-002', 'CLI-001', '2025-10-19', 10, 68, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-220', 'PRD-001', 2, 14),
('VNT-220', 'PRD-009', 1, 11),
('VNT-220', 'PRD-023', 2, 20),
('VNT-220', 'PRD-006', 2, 12),
('VNT-220', 'PRD-008', 1, 11);

-- Venta VNT-221 (Total: 59 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-221', 'EMP-003', 'CLI-005', '2025-10-18', 0, 59, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-221', 'PRD-014', 2, 20),
('VNT-221', 'PRD-009', 2, 22),
('VNT-221', 'PRD-004', 1, 7),
('VNT-221', 'PRD-023', 1, 10);

-- Venta VNT-222 (Total: 83 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-222', 'EMP-004', 'CLI-009', '2025-10-05', 12, 83, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-222', 'PRD-016', 3, 36),
('VNT-222', 'PRD-021', 2, 18),
('VNT-222', 'PRD-011', 1, 5),
('VNT-222', 'PRD-020', 3, 24);

-- Venta VNT-223 (Total: 27 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-223', 'EMP-002', 'CLI-006', '2025-10-22', 10, 27, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-223', 'PRD-012', 1, 12),
('VNT-223', 'PRD-020', 1, 8),
('VNT-223', 'PRD-005', 1, 7);

-- Venta VNT-224 (Total: 66 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-224', 'EMP-002', 'CLI-004', '2025-10-17', 0, 66, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-224', 'PRD-009', 2, 22),
('VNT-224', 'PRD-003', 2, 14),
('VNT-224', 'PRD-023', 3, 30);

-- Venta VNT-225 (Total: 63 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-225', 'EMP-002', 'CLI-001', '2025-10-06', 0, 63, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-225', 'PRD-007', 3, 18),
('VNT-225', 'PRD-012', 1, 12),
('VNT-225', 'PRD-004', 2, 14),
('VNT-225', 'PRD-003', 1, 7),
('VNT-225', 'PRD-016', 1, 12);

-- Venta VNT-226 (Total: 44 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-226', 'EMP-002', 'CLI-001', '2025-10-15', 3, 44, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-226', 'PRD-022', 1, 10),
('VNT-226', 'PRD-009', 2, 22),
('VNT-226', 'PRD-019', 1, 12);

-- Venta VNT-227 (Total: 100 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-227', 'EMP-003', 'CLI-0011', '2025-10-26', 12, 100, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-227', 'PRD-014', 2, 20),
('VNT-227', 'PRD-009', 3, 33),
('VNT-227', 'PRD-022', 2, 20),
('VNT-227', 'PRD-021', 3, 27);

-- Venta VNT-228 (Total: 65 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-228', 'EMP-002', 'CLI-0013', '2025-10-26', 12, 65, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-228', 'PRD-013', 2, 20),
('VNT-228', 'PRD-016', 2, 24),
('VNT-228', 'PRD-005', 3, 21);

-- Venta VNT-229 (Total: 15 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-229', 'EMP-003', 'CLI-0010', '2025-10-21', 15, 15, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-229', 'PRD-011', 3, 15);

-- Venta VNT-230 (Total: 111 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-230', 'EMP-004', 'CLI-0011', '2025-10-03', 10, 111, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-230', 'PRD-003', 1, 7),
('VNT-230', 'PRD-017', 3, 33),
('VNT-230', 'PRD-004', 3, 21),
('VNT-230', 'PRD-005', 2, 14),
('VNT-230', 'PRD-016', 3, 36);

-- Venta VNT-231 (Total: 81 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-231', 'EMP-001', 'CLI-007', '2025-10-31', 12, 81, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-231', 'PRD-016', 1, 12),
('VNT-231', 'PRD-012', 1, 12),
('VNT-231', 'PRD-017', 1, 11),
('VNT-231', 'PRD-020', 3, 24),
('VNT-231', 'PRD-015', 2, 22);

-- Venta VNT-232 (Total: 55 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-232', 'EMP-004', 'CLI-009', '2025-10-31', 5, 55, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-232', 'PRD-015', 2, 22),
('VNT-232', 'PRD-008', 3, 33);

-- Venta VNT-233 (Total: 99 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-233', 'EMP-001', 'CLI-009', '2025-10-01', 0, 99, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-233', 'PRD-022', 3, 30),
('VNT-233', 'PRD-020', 2, 16),
('VNT-233', 'PRD-001', 3, 21),
('VNT-233', 'PRD-005', 3, 21),
('VNT-233', 'PRD-009', 1, 11);

-- Venta VNT-234 (Total: 40 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-234', 'EMP-002', 'CLI-009', '2025-10-12', 12, 40, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-234', 'PRD-001', 1, 7),
('VNT-234', 'PRD-018', 1, 9),
('VNT-234', 'PRD-016', 2, 24);

-- Venta VNT-235 (Total: 59 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-235', 'EMP-002', 'CLI-002', '2025-10-07', 12, 59, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-235', 'PRD-010', 3, 15),
('VNT-235', 'PRD-002', 2, 14),
('VNT-235', 'PRD-023', 3, 30);

-- Venta VNT-236 (Total: 43 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-236', 'EMP-003', 'CLI-004', '2025-11-04', 8, 43, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-236', 'PRD-022', 1, 10),
('VNT-236', 'PRD-017', 1, 11),
('VNT-236', 'PRD-015', 2, 22);

-- Venta VNT-237 (Total: 51 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-237', 'EMP-002', 'CLI-004', '2025-11-01', 15, 51, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-237', 'PRD-020', 2, 16),
('VNT-237', 'PRD-011', 3, 15),
('VNT-237', 'PRD-021', 1, 9),
('VNT-237', 'PRD-008', 1, 11);

-- Venta VNT-238 (Total: 57 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-238', 'EMP-003', 'CLI-008', '2025-11-04', 12, 57, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-238', 'PRD-020', 1, 8),
('VNT-238', 'PRD-011', 2, 10),
('VNT-238', 'PRD-010', 3, 15),
('VNT-238', 'PRD-016', 2, 24);

-- Venta VNT-239 (Total: 36 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-239', 'EMP-004', 'CLI-007', '2025-11-07', 3, 36, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-239', 'PRD-012', 3, 36);

-- Venta VNT-240 (Total: 80 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-240', 'EMP-004', 'CLI-0010', '2025-11-02', 12, 80, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-240', 'PRD-006', 2, 12),
('VNT-240', 'PRD-007', 2, 12),
('VNT-240', 'PRD-019', 2, 24),
('VNT-240', 'PRD-001', 3, 21),
('VNT-240', 'PRD-017', 1, 11);

-- Venta VNT-241 (Total: 55 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-241', 'EMP-002', 'CLI-0011', '2025-11-06', 5, 55, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-241', 'PRD-023', 2, 20),
('VNT-241', 'PRD-001', 2, 14),
('VNT-241', 'PRD-003', 3, 21);

-- Venta VNT-242 (Total: 102 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-242', 'EMP-004', 'CLI-0011', '2025-11-05', 12, 102, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-242', 'PRD-008', 3, 33),
('VNT-242', 'PRD-009', 1, 11),
('VNT-242', 'PRD-012', 3, 36),
('VNT-242', 'PRD-017', 2, 22);

-- Venta VNT-243 (Total: 25 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-243', 'EMP-004', 'CLI-0010', '2025-11-10', 12, 25, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-243', 'PRD-003', 1, 7),
('VNT-243', 'PRD-005', 1, 7),
('VNT-243', 'PRD-009', 1, 11);

-- Venta VNT-244 (Total: 102 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-244', 'EMP-001', 'CLI-0013', '2025-11-08', 10, 102, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-244', 'PRD-022', 3, 30),
('VNT-244', 'PRD-002', 2, 14),
('VNT-244', 'PRD-009', 2, 22),
('VNT-244', 'PRD-019', 3, 36);

-- Venta VNT-245 (Total: 12 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-245', 'EMP-002', 'CLI-001', '2025-11-10', 10, 12, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-245', 'PRD-019', 1, 12);

-- Venta VNT-246 (Total: 40 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-246', 'EMP-001', 'CLI-0011', '2025-11-08', 0, 40, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-246', 'PRD-005', 3, 21),
('VNT-246', 'PRD-019', 1, 12),
('VNT-246', 'PRD-004', 1, 7);

-- Venta VNT-247 (Total: 55 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-247', 'EMP-001', 'CLI-013', '2025-11-03', 15, 55, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-247', 'PRD-019', 1, 12),
('VNT-247', 'PRD-001', 2, 14),
('VNT-247', 'PRD-008', 2, 22),
('VNT-247', 'PRD-003', 1, 7);

-- Venta VNT-248 (Total: 80 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-248', 'EMP-001', 'CLI-010', '2025-11-06', 3, 80, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-248', 'PRD-016', 1, 12),
('VNT-248', 'PRD-020', 3, 24),
('VNT-248', 'PRD-021', 3, 27),
('VNT-248', 'PRD-013', 1, 10),
('VNT-248', 'PRD-002', 1, 7);

-- Venta VNT-249 (Total: 50 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-249', 'EMP-002', 'CLI-005', '2025-11-07', 0, 50, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-249', 'PRD-008', 1, 11),
('VNT-249', 'PRD-021', 2, 18),
('VNT-249', 'PRD-003', 3, 21);

-- Venta VNT-250 (Total: 33 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-250', 'EMP-001', 'CLI-008', '2025-11-02', 12, 33, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-250', 'PRD-015', 3, 33);

-- Venta VNT-251 (Total: 69 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-251', 'EMP-002', 'CLI-013', '2025-11-08', 12, 69, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-251', 'PRD-015', 2, 22),
('VNT-251', 'PRD-006', 1, 6),
('VNT-251', 'PRD-013', 1, 10),
('VNT-251', 'PRD-012', 2, 24),
('VNT-251', 'PRD-005', 1, 7);

-- Venta VNT-252 (Total: 82 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-252', 'EMP-004', 'CLI-010', '2025-11-06', 0, 82, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-252', 'PRD-022', 2, 20),
('VNT-252', 'PRD-005', 2, 14),
('VNT-252', 'PRD-009', 1, 11),
('VNT-252', 'PRD-015', 2, 22),
('VNT-252', 'PRD-011', 3, 15);

-- Venta VNT-253 (Total: 83 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-253', 'EMP-002', 'CLI-004', '2025-11-04', 12, 83, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-253', 'PRD-015', 3, 33),
('VNT-253', 'PRD-013', 1, 10),
('VNT-253', 'PRD-017', 2, 22),
('VNT-253', 'PRD-007', 3, 18);

-- Venta VNT-254 (Total: 19 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-254', 'EMP-003', 'CLI-009', '2025-11-10', 10, 19, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-254', 'PRD-018', 1, 9),
('VNT-254', 'PRD-014', 1, 10);

-- Venta VNT-255 (Total: 44 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-255', 'EMP-003', 'CLI-013', '2025-11-10', 12, 44, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-255', 'PRD-020', 1, 8),
('VNT-255', 'PRD-006', 1, 6),
('VNT-255', 'PRD-014', 3, 30);

-- Venta VNT-256 (Total: 85 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-256', 'EMP-002', 'CLI-001', '2025-11-03', 15, 85, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-256', 'PRD-005', 1, 7),
('VNT-256', 'PRD-016', 3, 36),
('VNT-256', 'PRD-020', 3, 24),
('VNT-256', 'PRD-006', 3, 18);

-- Venta VNT-257 (Total: 88 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-257', 'EMP-003', 'CLI-008', '2025-11-07', 3, 88, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-257', 'PRD-009', 2, 22),
('VNT-257', 'PRD-002', 2, 14),
('VNT-257', 'PRD-015', 1, 11),
('VNT-257', 'PRD-023', 3, 30),
('VNT-257', 'PRD-017', 1, 11);

-- Venta VNT-258 (Total: 106 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-258', 'EMP-001', 'CLI-006', '2025-11-01', 5, 106, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-258', 'PRD-008', 1, 11),
('VNT-258', 'PRD-011', 3, 15),
('VNT-258', 'PRD-001', 2, 14),
('VNT-258', 'PRD-019', 3, 36),
('VNT-258', 'PRD-022', 3, 30);

-- Venta VNT-259 (Total: 65 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-259', 'EMP-002', 'CLI-012', '2025-11-02', 8, 65, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-259', 'PRD-014', 2, 20),
('VNT-259', 'PRD-022', 1, 10),
('VNT-259', 'PRD-004', 2, 14),
('VNT-259', 'PRD-006', 1, 6),
('VNT-259', 'PRD-010', 3, 15);

-- Venta VNT-260 (Total: 102 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-260', 'EMP-003', 'CLI-001', '2025-11-07', 5, 102, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-260', 'PRD-016', 3, 36),
('VNT-260', 'PRD-013', 2, 20),
('VNT-260', 'PRD-009', 1, 11),
('VNT-260', 'PRD-002', 2, 14),
('VNT-260', 'PRD-003', 3, 21);

-- Venta VNT-261 (Total: 90 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-261', 'EMP-002', 'CLI-012', '2025-11-07', 8, 90, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-261', 'PRD-004', 3, 21),
('VNT-261', 'PRD-001', 3, 21),
('VNT-261', 'PRD-012', 3, 36),
('VNT-261', 'PRD-006', 2, 12);

-- Venta VNT-262 (Total: 61 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-262', 'EMP-001', 'CLI-010', '2025-11-10', 0, 61, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-262', 'PRD-004', 2, 14),
('VNT-262', 'PRD-018', 2, 18),
('VNT-262', 'PRD-001', 1, 7),
('VNT-262', 'PRD-003', 1, 7),
('VNT-262', 'PRD-010', 3, 15);

-- Venta VNT-263 (Total: 86 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-263', 'EMP-003', 'CLI-007', '2025-11-07', 12, 86, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-263', 'PRD-019', 1, 12),
('VNT-263', 'PRD-012', 3, 36),
('VNT-263', 'PRD-006', 3, 18),
('VNT-263', 'PRD-023', 2, 20);

-- Venta VNT-264 (Total: 55 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-264', 'EMP-003', 'CLI-013', '2025-11-02', 5, 55, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-264', 'PRD-023', 1, 10),
('VNT-264', 'PRD-016', 2, 24),
('VNT-264', 'PRD-009', 1, 11),
('VNT-264', 'PRD-010', 2, 10);

-- Venta VNT-265 (Total: 99 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-265', 'EMP-002', 'CLI-010', '2025-11-05', 10, 99, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-265', 'PRD-013', 3, 30),
('VNT-265', 'PRD-004', 2, 14),
('VNT-265', 'PRD-003', 2, 14),
('VNT-265', 'PRD-015', 1, 11),
('VNT-265', 'PRD-014', 3, 30);

-- Venta VNT-266 (Total: 29 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-266', 'EMP-003', 'CLI-003', '2025-11-07', 3, 29, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-266', 'PRD-010', 2, 10),
('VNT-266', 'PRD-012', 1, 12),
('VNT-266', 'PRD-005', 1, 7);

-- Venta VNT-267 (Total: 89 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-267', 'EMP-003', 'CLI-008', '2025-11-03', 8, 89, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-267', 'PRD-015', 2, 22),
('VNT-267', 'PRD-020', 3, 24),
('VNT-267', 'PRD-009', 2, 22),
('VNT-267', 'PRD-001', 3, 21);

-- Venta VNT-268 (Total: 55 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-268', 'EMP-004', 'CLI-010', '2025-11-05', 12, 55, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-268', 'PRD-004', 1, 7),
('VNT-268', 'PRD-008', 3, 33),
('VNT-268', 'PRD-020', 1, 8),
('VNT-268', 'PRD-005', 1, 7);

-- Venta VNT-269 (Total: 45 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-269', 'EMP-004', 'CLI-013', '2025-11-03', 10, 45, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-269', 'PRD-013', 1, 10),
('VNT-269', 'PRD-004', 3, 21),
('VNT-269', 'PRD-002', 2, 14);

-- Venta VNT-270 (Total: 36 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-270', 'EMP-003', 'CLI-002', '2025-11-03', 10, 36, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-270', 'PRD-023', 2, 20),
('VNT-270', 'PRD-020', 2, 16);

-- Venta VNT-271 (Total: 80 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-271', 'EMP-003', 'CLI-004', '2025-11-02', 10, 80, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-271', 'PRD-020', 3, 24),
('VNT-271', 'PRD-023', 2, 20),
('VNT-271', 'PRD-012', 3, 36);

-- Venta VNT-272 (Total: 75 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-272', 'EMP-003', 'CLI-012', '2025-11-03', 12, 75, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-272', 'PRD-012', 2, 24),
('VNT-272', 'PRD-016', 2, 24),
('VNT-272', 'PRD-018', 3, 27);

-- Venta VNT-273 (Total: 102 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-273', 'EMP-002', 'CLI-013', '2025-11-07', 8, 102, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-273', 'PRD-009', 2, 22),
('VNT-273', 'PRD-008', 2, 22),
('VNT-273', 'PRD-023', 3, 30),
('VNT-273', 'PRD-018', 2, 18),
('VNT-273', 'PRD-013', 1, 10);

-- Venta VNT-274 (Total: 55 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-274', 'EMP-002', 'CLI-005', '2025-11-06', 3, 55, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-274', 'PRD-009', 3, 33),
('VNT-274', 'PRD-017', 2, 22);

-- Venta VNT-275 (Total: 29 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-275', 'EMP-004', 'CLI-013', '2025-11-10', 0, 29, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-275', 'PRD-017', 1, 11),
('VNT-275', 'PRD-006', 3, 18);

-- Venta VNT-276 (Total: 74 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-276', 'EMP-002', 'CLI-008', '2025-11-01', 10, 74, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-276', 'PRD-020', 2, 16),
('VNT-276', 'PRD-021', 3, 27),
('VNT-276', 'PRD-022', 1, 10),
('VNT-276', 'PRD-005', 3, 21);

-- Venta VNT-277 (Total: 43 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-277', 'EMP-003', 'CLI-006', '2025-11-01', 0, 43, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-277', 'PRD-005', 2, 14),
('VNT-277', 'PRD-004', 1, 7),
('VNT-277', 'PRD-008', 2, 22);

-- Venta VNT-278 (Total: 50 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-278', 'EMP-004', 'CLI-006', '2025-11-02', 0, 50, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-278', 'PRD-006', 3, 18),
('VNT-278', 'PRD-023', 1, 10),
('VNT-278', 'PRD-017', 2, 22);

-- Venta VNT-279 (Total: 56 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-279', 'EMP-002', 'CLI-010', '2025-11-07', 12, 56, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-279', 'PRD-020', 1, 8),
('VNT-279', 'PRD-022', 3, 30),
('VNT-279', 'PRD-006', 3, 18);

-- Venta VNT-280 (Total: 42 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-280', 'EMP-003', 'CLI-012', '2025-11-10', 15, 42, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-280', 'PRD-010', 2, 10),
('VNT-280', 'PRD-007', 3, 18),
('VNT-280', 'PRD-002', 2, 14);

-- Venta VNT-281 (Total: 29 Bs, Descuento: 5%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-281', 'EMP-003', 'CLI-004', '2025-11-03', 5, 29, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-281', 'PRD-002', 3, 21),
('VNT-281', 'PRD-020', 1, 8);

-- Venta VNT-282 (Total: 89 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-282', 'EMP-004', 'CLI-005', '2025-11-06', 8, 89, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-282', 'PRD-018', 1, 9),
('VNT-282', 'PRD-014', 3, 30),
('VNT-282', 'PRD-010', 2, 10),
('VNT-282', 'PRD-008', 3, 33),
('VNT-282', 'PRD-004', 1, 7);

-- Venta VNT-283 (Total: 127 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-283', 'EMP-003', 'CLI-008', '2025-11-02', 3, 127, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-283', 'PRD-008', 2, 22),
('VNT-283', 'PRD-002', 3, 21),
('VNT-283', 'PRD-014', 3, 30),
('VNT-283', 'PRD-012', 2, 24),
('VNT-283', 'PRD-022', 3, 30);

-- Venta VNT-284 (Total: 104 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-284', 'EMP-004', 'CLI-007', '2025-11-10', 12, 104, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-284', 'PRD-017', 1, 11),
('VNT-284', 'PRD-022', 3, 30),
('VNT-284', 'PRD-009', 3, 33),
('VNT-284', 'PRD-013', 3, 30);

-- Venta VNT-285 (Total: 68 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-285', 'EMP-004', 'CLI-013', '2025-11-08', 8, 68, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-285', 'PRD-001', 3, 21),
('VNT-285', 'PRD-008', 1, 11),
('VNT-285', 'PRD-006', 3, 18),
('VNT-285', 'PRD-007', 3, 18);

-- Venta VNT-286 (Total: 51 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-286', 'EMP-003', 'CLI-004', '2025-11-01', 10, 51, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-286', 'PRD-006', 3, 18),
('VNT-286', 'PRD-014', 1, 10),
('VNT-286', 'PRD-017', 1, 11),
('VNT-286', 'PRD-012', 1, 12);

-- Venta VNT-287 (Total: 100 Bs, Descuento: 8%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-287', 'EMP-001', 'CLI-011', '2025-11-02', 8, 100, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-287', 'PRD-023', 3, 30),
('VNT-287', 'PRD-014', 1, 10),
('VNT-287', 'PRD-020', 3, 24),
('VNT-287', 'PRD-019', 1, 12),
('VNT-287', 'PRD-016', 2, 24);

-- Venta VNT-288 (Total: 69 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-288', 'EMP-001', 'CLI-009', '2025-11-09', 15, 69, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-288', 'PRD-016', 2, 24),
('VNT-288', 'PRD-015', 3, 33),
('VNT-288', 'PRD-007', 2, 12);

-- Venta VNT-289 (Total: 99 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-289', 'EMP-002', 'CLI-007', '2025-11-03', 10, 99, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-289', 'PRD-007', 3, 18),
('VNT-289', 'PRD-023', 2, 20),
('VNT-289', 'PRD-006', 3, 18),
('VNT-289', 'PRD-009', 3, 33),
('VNT-289', 'PRD-013', 1, 10);

-- Venta VNT-290 (Total: 49 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-290', 'EMP-003', 'CLI-005', '2025-11-06', 15, 49, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-290', 'PRD-004', 1, 7),
('VNT-290', 'PRD-006', 1, 6),
('VNT-290', 'PRD-023', 2, 20),
('VNT-290', 'PRD-020', 2, 16);

-- Venta VNT-291 (Total: 59 Bs, Descuento: 3%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-291', 'EMP-002', 'CLI-006', '2025-11-09', 3, 59, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-291', 'PRD-006', 3, 18),
('VNT-291', 'PRD-015', 1, 11),
('VNT-291', 'PRD-005', 3, 21),
('VNT-291', 'PRD-018', 1, 9);

-- Venta VNT-292 (Total: 116 Bs, Descuento: 10%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-292', 'EMP-003', 'CLI-004', '2025-11-10', 10, 116, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-292', 'PRD-009', 3, 33),
('VNT-292', 'PRD-012', 3, 36),
('VNT-292', 'PRD-010', 3, 15),
('VNT-292', 'PRD-019', 2, 24),
('VNT-292', 'PRD-020', 1, 8);

-- Venta VNT-293 (Total: 52 Bs, Descuento: 0%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-293', 'EMP-004', 'CLI-006', '2025-11-10', 0, 52, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-293', 'PRD-008', 2, 22),
('VNT-293', 'PRD-021', 2, 18),
('VNT-293', 'PRD-019', 1, 12);

-- Venta VNT-294 (Total: 118 Bs, Descuento: 12%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-294', 'EMP-004', 'CLI-012', '2025-11-02', 12, 118, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-294', 'PRD-021', 1, 9),
('VNT-294', 'PRD-013', 3, 30),
('VNT-294', 'PRD-008', 3, 33),
('VNT-294', 'PRD-017', 2, 22),
('VNT-294', 'PRD-019', 2, 24);

-- Venta VNT-295 (Total: 45 Bs, Descuento: 15%)
INSERT INTO Venta (VentaID, EmpleadoID, ClienteID, FechaVenta, Descuento, Total, Archivada)
VALUES ('VNT-295', 'EMP-004', 'CLI-010', '2025-11-05', 15, 45, 0);

INSERT INTO DetalleVenta (VentaID, ProductoID, Cantidad, Subtotal)
VALUES
('VNT-295', 'PRD-004', 2, 14),
('VNT-295', 'PRD-003', 3, 21),
('VNT-295', 'PRD-010', 2, 10);
