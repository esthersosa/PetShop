import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { TutorController } from './controllers/TutorController.js';
import { PetController } from './controllers/PetController.js';
import { prisma } from './database/prisma.js';

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.resolve(process.cwd(), 'views'));
app.use(express.urlencoded({ extended: true })); 

// ROTA VISUAL PRINCIPAL: Painel unificado com Tutores, Pets e Agendamentos
app.get('/web/tutores', async (req, res) => {
  try {
    const tutores = await prisma.tutor.findMany();
    const pets = await prisma.pet.findMany({ include: { tutor: true } });
    const agendamentos = await prisma.agendamento.findMany({ include: { pet: true } });
    
    const linhasTutores = tutores.map(tutor => `
      <tr>
        <td><strong>${tutor.id}</strong></td>
        <td>${tutor.nome}</td>
        <td>${tutor.email}</td>
        <td>${tutor.telefone}</td>
      </tr>
    `).join('');

    const linhasPets = pets.map(pet => `
      <tr>
        <td><strong>${pet.id}</strong></td>
        <td>${pet.nome}</td>
        <td>${pet.especie} (${pet.raca})</td>
        <td>${pet.tutor?.nome || 'Não informado'} (ID: ${pet.tutorId})</td>
      </tr>
    `).join('');

    const linhasAgendamentos = agendamentos.map(ag => `
      <tr>
        <td><strong>${ag.id}</strong></td>
        <td>${new Date(ag.dataHora).toLocaleString('pt-BR')}</td>
        <td>${ag.servico}</td>
        <td>${ag.status}</td>
        <td>${ag.pet?.nome || 'Desconhecido'} (ID: ${ag.petId})</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PetShop - Painel de Controle</title>
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background-color: #f8f9fa; color: #333; }
              .container { max-width: 1000px; margin: 0 auto; }
              h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
              h2 { color: #34495e; margin-top: 25px; }
              .grid-formularios { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
              .form-group { margin-bottom: 12px; }
              .form-group label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; font-size: 13px; }
              .form-group input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 13px; }
              button { background-color: #1891e1; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold; width: 100%; transition: background 0.2s; }
              button:hover { background-color: #2980b9; }
              table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 10px; margin-bottom: 30px; }
              th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eeeeee; font-size: 14px; }
              th { background-color: #2c3e50; color: white; font-weight: 600; }
              tr:hover { background-color: #fcfcfc; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>🐾 Painel de Gestão do Pet Shop</h1>
              
              <div class="grid-formularios">
                  <!-- Formulário Tutor -->
                  <div class="card">
                      <h3>➕ Novo Tutor</h3>
                      <form action="/web/tutores" method="POST">
                          <div class="form-group">
                              <label>Nome Completo</label>
                              <input type="text" name="nome" placeholder="Ex: João da Silva" required>
                          </div>
                          <div class="form-group">
                              <label>E-mail</label>
                              <input type="email" name="email" placeholder="Ex: joao@email.com" required>
                          </div>
                          <div class="form-group">
                              <label>Telefone</label>
                              <input type="text" name="telefone" placeholder="Ex: 43999999999" required>
                          </div>
                          <button type="submit">Salvar Tutor</button>
                      </form>
                  </div>

                  <!-- Formulário Pet -->
                  <div class="card">
                      <h3>🐶 Novo Pet</h3>
                      <form action="/web/pets" method="POST">
                          <div class="form-group">
                              <label>Nome do Pet</label>
                              <input type="text" name="nome" placeholder="Ex: Floquinho" required>
                          </div>
                          <div class="form-group">
                              <label>Espécie</label>
                              <input type="text" name="especie" placeholder="Ex: Cachorro, Gato" required>
                          </div>
                          <div class="form-group">
                              <label>Raça</label>
                              <input type="text" name="raca" placeholder="Ex: Poodle, Persa" required>
                          </div>
                          <div class="form-group">
                              <label>ID do Tutor Dono</label>
                              <input type="number" name="tutorId" placeholder="Ex: 2" required>
                          </div>
                          <button type="submit" style="background-color: #2BB254;">Salvar Pet</button>
                      </form>
                  </div>

                  <!-- Formulário Agendamento -->
                  <div class="card">
                      <h3>📅 Novo Agendamento</h3>
                      <form action="/web/agendamentos" method="POST">
                          <div class="form-group">
                              <label>Data e Horário</label>
                              <input type="datetime-local" name="dataHora" required>
                          </div>
                          <div class="form-group">
                              <label>Serviço</label>
                              <input type="text" name="servico" placeholder="Ex: Banho e Tosa" required>
                          </div>
                          <div class="form-group">
                              <label>ID do Pet</label>
                              <input type="number" name="petId" placeholder="Ex: 1" required>
                          </div>
                          <button type="submit" style="background-color: #9b59b6;">Agendar Horário</button>
                      </form>
                  </div>
              </div>

              <h2>👥 Tutores Cadastrados</h2>
              <table>
                  <thead><tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Telefone</th></tr></thead>
                  <tbody>${linhasTutores || '<tr><td colspan="4">Nenhum tutor.</td></tr>'}</tbody>
              </table>

              <h2>🐇 Pets Cadastrados</h2>
              <table>
                  <thead><tr><th>ID</th><th>Nome</th><th>Espécie/Raça</th><th>Dono (Tutor)</th></tr></thead>
                  <tbody>${linhasPets || '<tr><td colspan="4">Nenhum pet cadastrado.</td></tr>'}</tbody>
              </table>

              <h2>📅 Compromissos Agendados</h2>
              <table>
                  <thead><tr><th>ID</th><th>Data/Hora</th><th>Serviço</th><th>Status</th><th>Pet</th></tr></thead>
                  <tbody>${linhasAgendamentos || '<tr><td colspan="5">Nenhum agendamento.</td></tr>'}</tbody>
              </table>
          </div>
      </body>
      </html>
    `;
    return res.send(html);
  } catch (error) {
    return res.status(500).send("Erro interno ao carregar os dados.");
  }
});

// Ações POST de recebimento dos formulários visuais
app.post('/web/tutores', async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;
    await prisma.tutor.create({ data: { nome, email, telefone } });
    res.redirect('/web/tutores');
  } catch { res.send('Erro ao cadastrar tutor. Verifique o e-mail.'); }
});

app.post('/web/pets', async (req, res) => {
  try {
    const { nome, especie, raca, tutorId } = req.body;
    await prisma.pet.create({ data: { nome, especie, raca, tutorId: Number(tutorId) } });
    res.redirect('/web/tutores');
  } catch { res.send('Erro ao cadastrar pet. Verifique se o ID do tutor existe.'); }
});

app.post('/web/agendamentos', async (req, res) => {
  try {
    const { dataHora, servico, petId } = req.body;
    await prisma.agendamento.create({ data: { dataHora: new Date(dataHora), servico, petId: Number(petId) } });
    res.redirect('/web/tutores');
  } catch { res.send('Erro ao criar agendamento.'); }
});

// Rotas da API Rest antigas mantidas
const tutorController = new TutorController();
const petController = new PetController();

app.post('/tutores', tutorController.create);
app.get('/tutores', tutorController.list);
app.put('/tutores/:id', tutorController.update);
app.delete('/tutores/:id', tutorController.delete);
app.post('/pets', petController.createPet);
app.post('/agendamentos', petController.createAgendamento);
app.get('/pets/:petId/historico', petController.getHistorico);

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

