const express = require('express');
const fs = require('fs');
const app = express();

// Usando JSON no body das requisições
app.use(express.json());

// Rota para salvar os dados no arquivo JSON
app.post('/saveData', (req, res) => {
  const dataToSave = req.body;  // Dados enviados pela requisição

  const jsonData = JSON.stringify(dataToSave, null, 2);

  fs.writeFile('historico.json', jsonData, (err) => {
    if (err) {
      res.status(500).send('Erro ao salvar os dados');
    } else {
      res.status(200).send('Dados salvos com sucesso em historico.json!');
    }
  });
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
