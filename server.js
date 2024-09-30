require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Definir o tempo limite para requisições
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutos
  next();
});

// Usar a variável de ambiente para o banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Servir arquivos estáticos do diretório "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal para receber dados do OwnTracks (ou Traccar)
app.post('/', async (req, res) => {
  try {
    const { _type, lat, lon, vel, tst, tid, batt } = req.body;

    // Verificar se o tipo de mensagem é "location" (próprio do OwnTracks)
    if (_type !== 'location') {
      return res.status(400).json({ message: 'Tipo de mensagem inválido!' });
    }

    // Verifica se os dados obrigatórios estão presentes
    if (!lat || !lon || !tst || !tid) {
      return res.status(400).json({ message: 'Dados de localização inválidos!' });
    }

    const timestamp = new Date(tst * 1000); // Convertendo timestamp UNIX para formato de data
    const query = `
            INSERT INTO localizacao (device_id, latitude, longitude, velocidade, timestamp, bateria)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
    await pool.query(query, [tid, lat, lon, vel || 0, timestamp, batt || 100]);

    return res.status(200).json({ message: 'Dados recebidos com sucesso!' });
  } catch (error) {
    console.error('Erro ao processar dados: ', error);
    return res.status(500).json({ message: 'Erro no servidor ao processar dados.' });
  }
});

// Rota para buscar as últimas localizações de todos os dispositivos
app.get('/locations', async (req, res) => {
  try {
    const query = `
            SELECT device_id, latitude, longitude, velocidade, timestamp, bateria
            FROM localizacao
            ORDER BY timestamp DESC
            LIMIT 50
        `;
    const result = await pool.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar localizações: ', error);
    return res.status(500).json({ message: 'Erro ao buscar localizações' });
  }
});

// Iniciar o servidor na porta 3000
app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor rodando na porta 3000');
});
