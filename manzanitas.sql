-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-03-2024 a las 16:05:20
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `manzanitas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `manzanas`
--

CREATE TABLE `manzanas` (
  `Cod_Manzana` int(10) NOT NULL,
  `Nombre_Manzana` varchar(100) NOT NULL,
  `Localidad` varchar(25) NOT NULL,
  `Direccion` varchar(255) NOT NULL,
  `Municipio` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `manzanas`
--

INSERT INTO `manzanas` (`Cod_Manzana`, `Nombre_Manzana`, `Localidad`, `Direccion`, `Municipio`) VALUES
(1, 'Bosa', 'Bosa', 'kra 100 sur 11-25', 'Cundinamarca'),
(2, 'Suba', 'Suba', 'cll 125 21-32', 'Cundinamarca'),
(3, 'Chapinero', 'Chapinero', 'Cra 45 #21-15', 'Cundinamarca');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `manzanas_servicio`
--

CREATE TABLE `manzanas_servicio` (
  `Id_Manzana1` int(10) DEFAULT NULL,
  `Id_Servicio2` int(10) DEFAULT NULL,
  `Dia_Y_Hora` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `manzanas_servicio`
--

INSERT INTO `manzanas_servicio` (`Id_Manzana1`, `Id_Servicio2`, `Dia_Y_Hora`) VALUES
(1, 10, NULL),
(1, 11, NULL),
(1, 12, NULL),
(1, 13, NULL),
(2, 7, NULL),
(2, 8, NULL),
(2, 9, NULL),
(3, 2, NULL),
(3, 3, NULL),
(3, 4, NULL),
(3, 5, NULL),
(3, 6, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mujeres`
--

CREATE TABLE `mujeres` (
  `Id_Mujer` int(10) NOT NULL,
  `Tipo_Documen` set('TI','CC') DEFAULT NULL,
  `Documento` bigint(19) NOT NULL,
  `Nombres` varchar(150) NOT NULL,
  `Apellidos` varchar(150) NOT NULL,
  `Tel` bigint(19) NOT NULL,
  `Correo_Elec` varchar(255) NOT NULL,
  `Ciudad` varchar(65) NOT NULL,
  `Direccion` varchar(255) NOT NULL,
  `Ocupacion` varchar(80) NOT NULL,
  `ROL` set('usuario','administrador') DEFAULT 'usuario',
  `FkManzana` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mujeres`
--

INSERT INTO `mujeres` (`Id_Mujer`, `Tipo_Documen`, `Documento`, `Nombres`, `Apellidos`, `Tel`, `Correo_Elec`, `Ciudad`, `Direccion`, `Ocupacion`, `ROL`, `FkManzana`) VALUES
(33, 'CC', 1019, 'David', 'Quintero', 3021, 'dav@gmail.com', 'Bogotá', 'CRA 97 64', 'Fumador', 'administrador', 2),
(34, 'TI', 1020, 'maia', 'rezos', 3023, 'Nata@gmail.com', 'Soacha', 'CRA 10 25-55', 'Come dulces', 'usuario', 3),
(35, 'TI', 1022, 'natalia', 'rezos', 3010, 'Natalya@gmail.com', 'Soacha', 'CRA 10 25-55', 'Traga', 'usuario', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio`
--

CREATE TABLE `servicio` (
  `Cod_Serv` int(10) NOT NULL,
  `Nom_Serv` varchar(255) NOT NULL,
  `Descripc` varchar(255) NOT NULL,
  `Categ_Serv` varchar(255) NOT NULL,
  `Tipo_Serv` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicio`
--

INSERT INTO `servicio` (`Cod_Serv`, `Nom_Serv`, `Descripc`, `Categ_Serv`, `Tipo_Serv`) VALUES
(2, 'Clases de baile', 'Se realizan clases de baile', 'Personal', 'Entretenimiento'),
(3, 'Cine', 'Se ven peliculas familiares', 'Servicio', 'Entretenimiento'),
(4, 'Piscina', 'Clases de natacion', 'Servicio', 'Deportes'),
(5, 'Gym', 'Se realiza prestamo de equipo de ejercicio', 'Servicio', 'Deportes'),
(6, 'Cocina', 'Se dan clases de gastronomia', 'Servicio', 'Gastronomia'),
(7, 'Lavando', 'Se realiza prestamo de lavadoras', 'Servicio', 'Aseo'),
(8, 'Piscina', 'Se dan clases de natacion', 'Servicio', 'Deportes'),
(9, 'Yoga', 'Se instruye en el yoga', 'Servicio', 'Deportes'),
(10, 'Lavando', 'Se realiza prestamo de lavadoras', 'Servicio', 'Aseo'),
(11, 'GYM', 'Se presta equipo de ejercicio', 'Servicio', 'Deportes'),
(12, 'Cocina', 'Se dan clases de gastronomia', 'Servicio', 'Gastronomia'),
(13, 'Coser', 'Se dan clases de coser', 'Servicio', 'Maquina');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `Cod_Solicitud` int(11) NOT NULL,
  `Fecha` datetime DEFAULT NULL,
  `fkMujeresSolicitudes` int(11) DEFAULT NULL,
  `servicio` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitudes`
--

INSERT INTO `solicitudes` (`Cod_Solicitud`, `Fecha`, `fkMujeresSolicitudes`, `servicio`) VALUES
(16, '2024-02-12 11:16:22', 35, 4),
(19, '2024-02-12 12:44:00', 35, 11),
(20, '2024-03-07 09:20:00', 34, 3);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `manzanas`
--
ALTER TABLE `manzanas`
  ADD PRIMARY KEY (`Cod_Manzana`);

--
-- Indices de la tabla `manzanas_servicio`
--
ALTER TABLE `manzanas_servicio`
  ADD KEY `fk_idmanzana1` (`Id_Manzana1`),
  ADD KEY `fk_idServicio2` (`Id_Servicio2`);

--
-- Indices de la tabla `mujeres`
--
ALTER TABLE `mujeres`
  ADD PRIMARY KEY (`Id_Mujer`),
  ADD UNIQUE KEY `Documento` (`Documento`),
  ADD KEY `Fk_idmanzana` (`FkManzana`);

--
-- Indices de la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD PRIMARY KEY (`Cod_Serv`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`Cod_Solicitud`),
  ADD KEY `fkSolicitudes2` (`fkMujeresSolicitudes`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `manzanas`
--
ALTER TABLE `manzanas`
  MODIFY `Cod_Manzana` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `mujeres`
--
ALTER TABLE `mujeres`
  MODIFY `Id_Mujer` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `servicio`
--
ALTER TABLE `servicio`
  MODIFY `Cod_Serv` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `Cod_Solicitud` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `manzanas_servicio`
--
ALTER TABLE `manzanas_servicio`
  ADD CONSTRAINT `fk_idServicio2` FOREIGN KEY (`Id_Servicio2`) REFERENCES `servicio` (`Cod_Serv`),
  ADD CONSTRAINT `fk_idmanzana1` FOREIGN KEY (`Id_Manzana1`) REFERENCES `manzanas` (`Cod_Manzana`);

--
-- Filtros para la tabla `mujeres`
--
ALTER TABLE `mujeres`
  ADD CONSTRAINT `Fk_idmanzana` FOREIGN KEY (`FkManzana`) REFERENCES `manzanas` (`Cod_Manzana`);

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `fkSolicitudes2` FOREIGN KEY (`fkMujeresSolicitudes`) REFERENCES `mujeres` (`Id_Mujer`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
