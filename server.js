import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Express
const app = express();
app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const dbPath = './database.db';
let db;

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        reject(err);
        return;
      }
      
      db.run(`
        CREATE TABLE IF NOT EXISTS links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT NOT NULL,
          logo TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Erro ao criar tabela:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

// Middleware para validação de dados
const validateLinkData = (req, res, next) => {
  const { url, logo } = req.body;
  
  if (!url || !logo) {
    return res.status(400).json({ 
      error: 'URL e logo são campos obrigatórios' 
    });
  }

  try {
    new URL(url); // Valida se a URL é válida
  } catch (err) {
    return res.status(400).json({ 
      error: 'URL inválida' 
    });
  }

  next();
};

// Rotas
app.post('/links', validateLinkData, async (req, res) => {
  const { url, logo } = req.body;
  
  try {
    const result = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO links (url, logo) VALUES (?, ?)",
        [url, logo],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.status(201).json({ 
      id: result,
      message: 'Link criado com sucesso' 
    });
  } catch (err) {
    console.error('Erro ao inserir link:', err);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

app.get('/links', async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM links ORDER BY created_at DESC", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar links:', err);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

app.delete('/links/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await new Promise((resolve, reject) => {
      db.run("DELETE FROM links WHERE id = ?", [id], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    if (result === 0) {
      return res.status(404).json({ error: 'Link não encontrado' });
    }

    res.json({ message: 'Link excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir link:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Tratamento de erros para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada' 
  });
});

// Inicialização do servidor
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
}

startServer();

// Tratamento de encerramento gracioso
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar banco de dados:', err);
    } else {
      console.log('Conexão com banco de dados fechada');
    }
    process.exit(err ? 1 : 0);
  });
});