// --- Inicialização de Estado ---
let database = JSON.parse(localStorage.getItem('satellite_y_db')) || {
  achados: [],
  ocorrencias: [],
  ciencia: [],
  reserva: [],
  frota: [],
  reciclagem: [],
  doacoes: [],
  comentarios: []
};

// --- Relógio e Telemetria Orbital ---
function updateClock() {
  const now = new Date();
  document.getElementById('telemetryTime').innerText = now.toUTCString().split(' ')[4] + ' UTC';
}
setInterval(updateClock, 1000);
updateClock();

// --- Alternância de Abas ---
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

// --- Alternar Tema (Dark / Light) ---
document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const icon = document.querySelector('#themeToggle i');
  icon.classList.toggle('fa-moon');
  icon.classList.toggle('fa-sun');
});

// --- Protocolo Y (Codificação e Envio Satelital) ---
function processProtocolY() {
  const input = document.getElementById('yInput').value;
  if (!input) return;

  // Algoritmo de Criptografia Simples Protocolo Y
  const encoded = btoa(input.split('').reverse().join('')) + '-SAT-Y';
  
  document.getElementById('yResult').innerHTML = `
    <strong>[TRANSMISSÃO TELEMÉTRICA OK]</strong><br>
    <code>Código Y: ${encoded}</code>
  `;

  // Animação temporária no status do satélite
  const satText = document.getElementById('satStatusText');
  satText.innerText = 'SAT-Y10: TRANSMITINDO DADOS...';
  satText.style.color = '#00f0ff';
  
  setTimeout(() => {
    satText.innerText = 'SAT-Y10: SINAL ESTÁVEL (ORBITA LEO)';
    satText.style.color = '';
  }, 3000);
}

// --- Conversão de Imagem para Base64 ---
function getBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) resolve('');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// --- Salvar Dados Genericamente ---
async function saveRecord(event, type) {
  event.preventDefault();
  
  let record = { id: Date.now() };

  if (type === 'achados') {
    const file = document.getElementById('achadosFoto').files[0];
    record.nome = document.getElementById('achadosNome').value;
    record.local = document.getElementById('achadosLocal').value;
    record.data = document.getElementById('achadosData').value;
    record.status = document.getElementById('achadosStatus').value;
    record.retirou = document.getElementById('achadosRetirou').value || 'N/A';
    record.foto = await getBase64(file);
  } else if (type === 'ocorrencias') {
    record.aluno = document.getElementById('ocorrenciaAluno').value;
    record.turma = document.getElementById('ocorrenciaTurma').value;
    record.tipo = document.getElementById('ocorrenciaTipo').value;
    record.data = document.getElementById('ocorrenciaData').value;
    record.desc = document.getElementById('ocorrenciaDesc').value;
    record.acao = document.getElementById('ocorrenciaAcao').value;
  } else if (type === 'ciencia') {
    const file = document.getElementById('cienciaFoto').files[0];
    record.titulo = document.getElementById('cienciaTitulo').value;
    record.grupo = document.getElementById('cienciaGrupo').value;
    record.orientador = document.getElementById('cienciaOrientador').value;
    record.link = document.getElementById('cienciaLink').value;
    record.resumo = document.getElementById('cienciaResumo').value;
    record.foto = await getBase64(file);
  } else if (type === 'reserva') {
    record.prof = document.getElementById('reservaProf').value;
    record.recurso = document.getElementById('reservaRecurso').value;
    record.data = document.getElementById('reservaData').value;
    record.horario = document.getElementById('reservaHorario').value;
    record.finalidade = document.getElementById('reservaFinalidade').value;
  } else if (type === 'frota') {
    const file = document.getElementById('frotaComprovante').files[0];
    record.placa = document.getElementById('frotaPlaca').value;
    record.motorista = document.getElementById('frotaMotorista').value;
    record.km = document.getElementById('frotaKm').value;
    record.valor = document.getElementById('frotaValor').value;
    record.litros = document.getElementById('frotaLitros').value;
    record.foto = await getBase64(file);
  } else if (type === 'reciclagem') {
    const file = document.getElementById('reciclagemFoto').files[0];
    record.nome = document.getElementById('reciclagemNome').value;
    record.end = document.getElementById('reciclagemEnd').value;
    record.materiais = document.getElementById('reciclagemMateriais').value;
    record.horario = document.getElementById('reciclagemHorario').value;
    record.foto = await getBase64(file);
  } else if (type === 'doacoes') {
    const file = document.getElementById('doacaoFoto').files[0];
    record.doador = document.getElementById('doacaoDoador').value;
    record.tipoItem = document.getElementById('doacaoTipo').value;
    record.qtd = document.getElementById('doacaoQtd').value;
    record.ponto = document.getElementById('doacaoPonto').value;
    record.data = document.getElementById('doacaoData').value;
    record.foto = await getBase64(file);
  }

  database[type].push(record);
  persistData();
  renderAll();
  event.target.reset();
}

// --- Salvar Comentário ---
function saveComentario(e) {
  e.preventDefault();
  const com = {
    id: Date.now(),
    autor: document.getElementById('comentarioAutor').value,
    nota: document.getElementById('comentarioNota').value,
    texto: document.getElementById('comentarioTexto').value,
    data: new Date().toLocaleDateString()
  };
  database.comentarios.push(com);
  persistData();
  renderComentarios();
  e.target.reset();
}

// --- Deletar Registro ---
function deleteRecord(type, id) {
  database[type] = database[type].filter(item => item.id !== id);
  persistData();
  renderAll();
}

// --- Persistência LocalStorage ---
function persistData() {
  localStorage.setItem('satellite_y_db', JSON.stringify(database));
}

// --- Renderização Dinâmica das Listas ---
function renderAll() {
  renderAchados();
  renderOcorrencias();
  renderCiencia();
  renderReserva();
  renderFrota();
  renderReciclagem();
  renderDoacoes();
  renderComentarios();
}

function renderAchados() {
  const tbody = document.getElementById('listAchados');
  tbody.innerHTML = database.achados.map(item => `
    <tr>
      <td>${item.foto ? `<img src="${item.foto}" class="thumb-img">` : 'Sem foto'}</td>
      <td>${item.nome}</td>
      <td>${item.local}</td>
      <td>${item.data}</td>
      <td><span class="tag">${item.status}</span></td>
      <td>${item.retirou}</td>
      <td><button class="btn-delete" onclick="deleteRecord('achados', ${item.id})"><i class="fa-solid fa-trash"></i></button></td>
    </tr>
  `).join('');
}

function renderOcorrencias() {
  const tbody = document.getElementById('listOcorrencias');
  tbody.innerHTML = database.ocorrencias.map(item => `
    <tr>
      <td>${item.aluno}</td>
      <td>${item.turma}</td>
      <td>${item.tipo}</td>
      <td>${item.desc}</td>
      <td>${item.acao}</td>
      <td>${item.data}</td>
      <td><button class="btn-delete" onclick="deleteRecord('ocorrencias', ${item.id})"><i class="fa-solid fa-trash"></i></button></td>
    </tr>
  `).join('');
}

function renderCiencia() {
  const grid = document.getElementById('listCiencia');
  grid.innerHTML = database.ciencia.map(item => `
    <div class="card">
      ${item.foto ? `<img src="${item.foto}">` : ''}
      <h3>${item.titulo}</h3>
      <p><strong>Turma:</strong> ${item.grupo}</p>
      <p><strong>Orientador:</strong> ${item.orientador}</p>
      <p>${item.resumo}</p>
      ${item.link ? `<a href="${item.link}" target="_blank" style="color:var(--accent-color)">Ver Apresentação</a><br>` : ''}
      <button class="btn-delete" onclick="deleteRecord('ciencia', ${item.id})" style="margin-top:10px;"><i class="fa-solid fa-trash"></i> Deletar</button>
    </div>
  `).join('');
}

function renderReserva() {
  const tbody = document.getElementById('listReserva');
  tbody.innerHTML = database.reserva.map(item => `
    <tr>
      <td>${item.prof}</td>
      <td>${item.recurso}</td>
      <td>${item.data}</td>
      <td>${item.horario}</td>
      <td>${item.finalidade}</td>
      <td><button class="btn-delete" onclick="deleteRecord('reserva', ${item.id})"><i class="fa-solid fa-trash"></i></button></td>
    </tr>
  `).join('');
}

function renderFrota() {
  const tbody = document.getElementById('listFrota');
  tbody.innerHTML = database.frota.map(item => `
    <tr>
      <td>${item.foto ? `<img src="${item.foto}" class="thumb-img">` : 'Sem Foto'}</td>
      <td>${item.placa}</td>
      <td>${item.motorista}</td>
      <td>${item.km} Km</td>
      <td>R$ ${item.valor}</td>
      <td>${item.litros} L</td>
      <td><button class="btn-delete" onclick="deleteRecord('frota', ${item.id})"><i class="fa-solid fa-trash"></i></button></td>
    </tr>
  `).join('');
}

function renderReciclagem() {
  const grid = document.getElementById('listReciclagem');
  grid.innerHTML = database.reciclagem.map(item => `
    <div class="card">
      ${item.foto ? `<img src="${item.foto}">` : ''}
      <h3>${item.nome}</h3>
      <p><strong>Endereço:</strong> ${item.end}</p>
      <p><strong>Aceita:</strong> ${item.materiais}</p>
      <p><strong>Horário:</strong> ${item.horario}</p>
      <button class="btn-delete" onclick="deleteRecord('reciclagem', ${item.id})" style="margin-top:10px;"><i class="fa-solid fa-trash"></i> Deletar</button>
    </div>
  `).join('');
}

function renderDoacoes() {
  const grid = document.getElementById('listDoacoes');
  grid.innerHTML = database.doacoes.map(item => `
    <div class="card">
      ${item.foto ? `<img src="${item.foto}">` : ''}
      <h3>${item.doador}</h3>
      <p><strong>Item:</strong> ${item.tipoItem} (Qtd: ${item.qtd})</p>
      <p><strong>Ponto:</strong> ${item.ponto}</p>
      <p><strong>Data:</strong> ${item.data}</p>
      <button class="btn-delete" onclick="deleteRecord('doacoes', ${item.id})" style="margin-top:10px;"><i class="fa-solid fa-trash"></i> Deletar</button>
    </div>
  `).join('');
}

function renderComentarios() {
  const list = document.getElementById('listComentarios');
  list.innerHTML = database.comentarios.map(item => `
    <div class="card" style="margin-top:10px;">
      <h4>${item.autor} - ${'⭐'.repeat(item.nota)}</h4>
      <small style="color:#aaa">${item.data}</small>
      <p style="margin-top:5px;">${item.texto}</p>
    </div>
  `).join('');
}

// Carregar Dados ao Abrir a Página
renderAll();