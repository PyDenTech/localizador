require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());

// Usar a variável de ambiente para o banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Rota para receber dados do Traccar Client
app.post('/', async (req, res) => {
    try {
      const { latitude, longitude, speed, bearing, timestamp } = req.body;
  
      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Dados inválidos!' });
      }
  
      const query = `
        INSERT INTO localizacao (latitude, longitude, velocidade, direcao, timestamp)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await pool.query(query, [latitude, longitude, speed, bearing, timestamp]);
  
      res.status(200).json({ message: 'Dados recebidos com sucesso!' });
    } catch (error) {
      console.error('Erro ao processar dados: ', error);
      res.status(500).json({ message: 'Erro no servidor' });
    }
  });
  

app.listen(5055, '0.0.0.0', () => {
    console.log('Servidor rodando na porta 5055');
  });
  
