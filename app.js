const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Configuração do banco de dados
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Maite@2024",
  database: "systic",
};

// Criação da conexão com o banco de dados
const db = mysql.createConnection(dbConfig);

// Conexão com o banco de dados
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar com o banco de dados:", err);
    return;
  }
  console.log("Conectado com o banco de dados!");
});

// Rota para testar a conexão
app.get("/v1/entrada-saida", (req, res) => {
  db.query("SELECT * FROM dados", (err, results) => {
    if (err) {
      console.error("Erro ao executar a query:", err);
      res.status(500).send({ message: "Erro ao executar a query" });
    } else {
      res.send(results);
      console.log("/v1/entrada-saida, executada com sucesso", results.length);
    }
  });
});

// Rota para criar um novo registro
app.post("/v1/entrada-saida/dados/novo", (req, res) => {
  const { tipo, valor, data, descricao } = req.body;
  db.query(
    "INSERT INTO dados SET ?",
    { tipo, valor, data, descricao },
    (err, results) => {
      if (err) {
        console.error("Erro ao executar a query:", err);
        res.status(500).json({ message: "Erro ao executar a query" });
      } else {
        res.status(201).json({ message: "Registro criado com sucesso!" });
        console.log("/v1/entrada-saida/dados/novo, executado com sucesso!");
      }
    }
  );
});

// Rota para atualizar um registro
app.put("/v1/entrada-saida/dados/:id", (req, res) => {
  const id = req.params.id;
  const { tipo, valor, data, descricao } = req.body;

  db.query(
    "UPDATE dados SET ? WHERE id = ?",
    [{ tipo, valor, data, descricao }, id],
    (err, results) => {
      if (err) {
        console.error("Erro ao executar a query:", err);
        res.status(500).json({ message: "Erro ao executar a query" });
      } else {
        if (results.affectedRows === 0) {
          res.status(404).json({ message: "Registro não encontrado" });
        } else {
          res.status(200).json({ message: "Registro atualizado com sucesso!" });
          console.log(
            "/v1/entrada-saida/dados/:" + id + ",, executado com sucesso!"
          );
        }
      }
    }
  );
});

// Rota para excluir um registro
app.delete("/v1/entrada-saida/dados/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM dados WHERE id = ?", id, (err, results) => {
    if (err) {
      console.error("Erro ao executar a query:", err);
      res.status(500).json({ message: "Erro ao executar a query" });
    } else {
      if (results.affectedRows === 0) {
        res.status(404).json({ message: "Registro não encontrado" });
      } else {
        res.status(200).json({ message: "Registro excluído com sucesso!" });
        console.log(
          "/v1/entrada-saida/dados/:" + id + ", excluído com sucesso!"
        );
      }
    }
  });
});

//Config para inicializar o front no servidor
const baseDir = `${__dirname}/build/`;
app.use(express.static(`${baseDir}`));

app.get("*", (req, res) => res.sendFile("index.html", { root: baseDir }));

// Inicia o servidor
const port = 8080;
app.listen(port, () =>
  console.log(`Servidor subiu com sucesso em http://localhost:${port}`)
);
