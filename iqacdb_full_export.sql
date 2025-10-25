-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: iqacdb
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `app_user`
--

DROP TABLE IF EXISTS `app_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','evaluator','faculty','viewer') NOT NULL,
  `faculty_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `faculty_id` (`faculty_id`),
  CONSTRAINT `app_user_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_user`
--

LOCK TABLES `app_user` WRITE;
/*!40000 ALTER TABLE `app_user` DISABLE KEYS */;
INSERT INTO `app_user` VALUES (1,'admin','changemehash','admin',NULL);
/*!40000 ALTER TABLE `app_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'CSE'),(2,'ECE');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty`
--

DROP TABLE IF EXISTS `faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(20) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `faculty_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty`
--

LOCK TABLES `faculty` WRITE;
/*!40000 ALTER TABLE `faculty` DISABLE KEYS */;
INSERT INTO `faculty` VALUES (1,'F001','Amit','Kumar','amit.k@example.com','8685754194',1,'2018-07-01','2025-10-21 11:17:45'),(2,'F002','Neha','Sharma','neha.s@example.com','7287089974',1,'2019-09-15','2025-10-21 11:17:45'),(3,'F003','Rohan','Singh','rohan.singh@example.com','8282922048',1,'2018-02-11','2025-10-21 11:28:10'),(4,'F004','Priya','Verma','priya.verma@example.com','9791709421',2,'2019-06-19','2025-10-21 11:28:10'),(5,'F005','Rahul','Das','rahul.das@example.com','7496180857',1,'2020-01-25','2025-10-21 11:28:10'),(6,'F006','Sneha','Nair','sneha.nair@example.com','6302051781',2,'2017-08-14','2025-10-21 11:28:10'),(7,'F007','Ankit','Patel','ankit.patel@example.com','9273356394',1,'2021-04-30','2025-10-21 11:28:10'),(8,'F008','Divya','Sinha','divya.sinha@example.com','7475305736',1,'2016-03-12','2025-10-21 11:28:10'),(9,'F009','Manish','Gupta','manish.g@example.com','8570601722',2,'2020-10-05','2025-10-21 11:28:10'),(10,'F010','Aarti','Mishra','aarti.mishra@example.com','7563681380',1,'2019-07-07','2025-10-21 11:28:10'),(11,'F011','Deepak','Yadav','deepak.yadav@example.com','6574530999',2,'2018-09-20','2025-10-21 11:28:10'),(12,'F012','Isha','Agarwal','isha.agarwal@example.com','8842956847',1,'2017-11-25','2025-10-21 11:28:10'),(13,'F013','Nitin','Raj','nitin.raj@example.com','8845401379',1,'2019-04-04','2025-10-21 11:28:10'),(14,'F014','Pooja','Rai','pooja.rai@example.com','8476014853',2,'2021-02-15','2025-10-21 11:28:10'),(15,'F015','Gaurav','Sen','gaurav.sen@example.com','9435670088',1,'2016-12-09','2025-10-21 11:28:10'),(16,'F016','Kavita','Dasgupta','kavita.dasgupta@example.com','7993598272',2,'2018-03-22','2025-10-21 11:28:10'),(17,'F017','Aditya','Bose','aditya.bose@example.com','6957336650',1,'2017-05-18','2025-10-21 11:28:10'),(18,'F018','Meena','Thakur','meena.thakur@example.com','6247012181',1,'2020-09-28','2025-10-21 11:28:10'),(19,'F019','Suresh','Menon','suresh.menon@example.com','6077201872',2,'2019-11-12','2025-10-21 11:28:10'),(20,'F020','Tanya','Kaur','tanya.kaur@example.com','9243726215',1,'2018-01-10','2025-10-21 11:28:10'),(21,'F021','Karan','Reddy','karan.reddy@example.com','6935981522',2,'2017-10-30','2025-10-21 11:28:10'),(22,'F022','Ritika','Pillai','ritika.pillai@example.com','6590113259',1,'2016-04-19','2025-10-21 11:28:10'),(23,'F023','Mohit','Chopra','mohit.chopra@example.com','8788318506',2,'2021-06-05','2025-10-21 11:28:10'),(24,'F024','Sonal','Bhattacharya','sonal.b@example.com','9667032560',1,'2019-08-15','2025-10-21 11:28:10'),(25,'F025','Nikhil','Roy','nikhil.roy@example.com','8578752360',1,'2020-05-01','2025-10-21 11:28:10'),(26,'F026','Harsha','Vora','harsha.vora@example.com','6993002092',2,'2018-07-24','2025-10-21 11:28:10'),(27,'F027','Aman','Kapoor','aman.kapoor@example.com','9658268785',1,'2017-03-13','2025-10-21 11:28:10'),(28,'F028','Shruti','Dey','shruti.dey@example.com','6570088373',2,'2019-12-11','2025-10-21 11:28:10'),(29,'F029','Vinay','Ghosh','vinay.ghosh@example.com','9907260293',1,'2020-10-23','2025-10-21 11:28:10'),(30,'F030','Lakshmi','Rao','lakshmi.rao@example.com','9107150504',2,'2018-02-03','2025-10-21 11:28:10'),(31,'F031','Arjun','Joshi','arjun.joshi@example.com','9870517215',1,'2019-09-09','2025-10-21 11:28:10'),(32,'F032','Smita','Bhandari','smita.bhandari@example.com','9575472832',2,'2020-06-21','2025-10-21 11:28:10'),(33,'F033','Vivek','Saxena','vivek.saxena@example.com','9099329149',1,'2017-12-16','2025-10-21 11:28:10'),(34,'F034','Anjali','Kurup','anjali.kurup@example.com','9707998625',2,'2018-10-01','2025-10-21 11:28:10'),(35,'F035','Ravi','Pandey','ravi.pandey@example.com','7558011819',1,'2016-06-18','2025-10-21 11:28:10'),(36,'F036','Neelam','Chatterjee','neelam.c@example.com','9230237210',2,'2020-02-11','2025-10-21 11:28:10'),(37,'F037','Sanjay','Malik','sanjay.malik@example.com','7352400901',1,'2019-07-25','2025-10-21 11:28:10'),(38,'F038','Bhavna','Chauhan','bhavna.c@example.com','6623482504',2,'2018-04-02','2025-10-21 11:28:10'),(39,'F039','Tarun','Khatri','tarun.khatri@example.com','8674559752',1,'2020-09-19','2025-10-21 11:28:10'),(40,'F040','Asha','Iyer','asha.iyer@example.com','8205293026',2,'2019-03-27','2025-10-21 11:28:10'),(41,'F041','Rajesh','Panda','rajesh.panda@example.com','7829530019',1,'2018-08-08','2025-10-21 11:28:10'),(42,'F042','Simran','Joshi','simran.joshi@example.com','9913433398',2,'2021-01-15','2025-10-21 11:28:10'),(43,'F043','Vikas','Singhania','vikas.singhania@example.com','8889464666',1,'2017-05-29','2025-10-21 11:28:10'),(44,'F044','Monika','Paul','monika.paul@example.com','8678928366',2,'2016-09-20','2025-10-21 11:28:10'),(45,'F045','Dinesh','Gaur','dinesh.gaur@example.com','6894457238',1,'2020-07-18','2025-10-21 11:28:10'),(46,'F046','Rashmi','Roy','rashmi.roy@example.com','7884332511',2,'2019-10-24','2025-10-21 11:28:10'),(47,'F047','Kunal','Dutta','kunal.dutta@example.com','6752202846',1,'2021-03-03','2025-10-21 11:28:10'),(48,'F048','Alka','Tiwari','alka.tiwari@example.com','9332861762',2,'2017-07-28','2025-10-21 11:28:10'),(49,'F049','Vineet','Pawar','vineet.pawar@example.com','8554548148',1,'2019-05-06','2025-10-21 11:28:10'),(50,'F050','Preeti','Naik','preeti.naik@example.com','6540659234',2,'2018-12-19','2025-10-21 11:28:10');
/*!40000 ALTER TABLE `faculty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iqac_aggregate`
--

DROP TABLE IF EXISTS `iqac_aggregate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iqac_aggregate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty_id` int NOT NULL,
  `period` varchar(20) NOT NULL,
  `total_score` decimal(6,3) DEFAULT NULL,
  `computed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `faculty_id` (`faculty_id`,`period`),
  CONSTRAINT `iqac_aggregate_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iqac_aggregate`
--

LOCK TABLES `iqac_aggregate` WRITE;
/*!40000 ALTER TABLE `iqac_aggregate` DISABLE KEYS */;
/*!40000 ALTER TABLE `iqac_aggregate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iqac_indicator`
--

DROP TABLE IF EXISTS `iqac_indicator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iqac_indicator` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(10) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `weight` decimal(5,4) NOT NULL DEFAULT '0.0000',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iqac_indicator`
--

LOCK TABLES `iqac_indicator` WRITE;
/*!40000 ALTER TABLE `iqac_indicator` DISABLE KEYS */;
INSERT INTO `iqac_indicator` VALUES (1,'TEA','Teaching','Teaching effectiveness',0.5000),(2,'RES','Research','Research output',0.3000),(3,'EXT','Extension','Extension & outreach',0.2000);
/*!40000 ALTER TABLE `iqac_indicator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iqac_record`
--

DROP TABLE IF EXISTS `iqac_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iqac_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty_id` int NOT NULL,
  `indicator_id` int NOT NULL,
  `period` varchar(20) NOT NULL,
  `value` decimal(6,2) NOT NULL,
  `evaluator_id` int DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `source_doc` text,
  PRIMARY KEY (`id`),
  KEY `faculty_id` (`faculty_id`),
  KEY `indicator_id` (`indicator_id`),
  KEY `evaluator_id` (`evaluator_id`),
  CONSTRAINT `iqac_record_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`),
  CONSTRAINT `iqac_record_ibfk_2` FOREIGN KEY (`indicator_id`) REFERENCES `iqac_indicator` (`id`),
  CONSTRAINT `iqac_record_ibfk_3` FOREIGN KEY (`evaluator_id`) REFERENCES `app_user` (`id`),
  CONSTRAINT `iqac_record_chk_1` CHECK ((`value` between 0 and 100))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iqac_record`
--

LOCK TABLES `iqac_record` WRITE;
/*!40000 ALTER TABLE `iqac_record` DISABLE KEYS */;
INSERT INTO `iqac_record` VALUES (1,1,1,'2024-S1',85.00,1,'2025-10-21 11:17:46',NULL),(2,1,2,'2024-S1',70.00,1,'2025-10-21 11:17:46',NULL),(3,1,3,'2024-S1',90.00,1,'2025-10-21 11:17:46',NULL),(4,2,1,'2024-S1',78.00,1,'2025-10-21 11:17:46',NULL),(5,2,2,'2024-S1',88.00,1,'2025-10-21 11:17:46',NULL),(6,2,3,'2024-S1',75.00,1,'2025-10-21 11:17:46',NULL);
/*!40000 ALTER TABLE `iqac_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `view_faculty_iqac_score`
--

DROP TABLE IF EXISTS `view_faculty_iqac_score`;
/*!50001 DROP VIEW IF EXISTS `view_faculty_iqac_score`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_faculty_iqac_score` AS SELECT 
 1 AS `faculty_id`,
 1 AS `faculty_name`,
 1 AS `period`,
 1 AS `weighted_score`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `view_faculty_iqac_score`
--

/*!50001 DROP VIEW IF EXISTS `view_faculty_iqac_score`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_faculty_iqac_score` AS select `f`.`id` AS `faculty_id`,concat(`f`.`first_name`,' ',`f`.`last_name`) AS `faculty_name`,`r`.`period` AS `period`,round((sum((`r`.`value` * `i`.`weight`)) / sum(`i`.`weight`)),2) AS `weighted_score` from ((`iqac_record` `r` join `iqac_indicator` `i` on((`r`.`indicator_id` = `i`.`id`))) join `faculty` `f` on((`r`.`faculty_id` = `f`.`id`))) group by `f`.`id`,`r`.`period` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-21 17:04:03
