const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Inicializando o servidor Express
const app = express();
app.use(bodyParser.json());

// Configuração do PostgreSQL
const pool = new Pool({
  user: 'seu_usuario',
  host: 'localhost',
  database: 'seu_banco_de_dados',
  password: 'sua_senha',
  port: 5432,
});

// Rota para capturar os dados do Traccar Client
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

// Iniciar o servidor na porta 5055
const port = 5055;
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});