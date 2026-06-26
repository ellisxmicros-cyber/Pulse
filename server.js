const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Configuración de conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

           

