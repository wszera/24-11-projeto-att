// Variáveis para o gerenciamento de tarefas e atividades
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let streak = parseInt(localStorage.getItem('streak')) || 0;
let completedTasksHistory = JSON.parse(localStorage.getItem('completedTasksHistory')) || [];  // Histórico de tarefas concluídas

// Elementos da UI
const taskInput = document.getElementById('task-input');
const tagSelect = document.getElementById('tag-select');
const taskLists = {
  saude: document.getElementById('task-list-saude'),
  estudo: document.getElementById('task-list-estudo'),
  lazer: document.getElementById('task-list-lazer'),
  trabalho: document.getElementById('task-list-trabalho'),
  outros: document.getElementById('task-list-outros')
};
const streakCount = document.getElementById('streak-count');
const streakBar = document.getElementById('streak-bar');
const finishDayBtn = document.getElementById('finish-day-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const activityInput = document.getElementById('activity');
const historyList = document.getElementById('history-list');
const reportElement = document.getElementById('report');
const activityStatsContainer = document.getElementById("activityStats");
const competitionHistoryContainer = document.getElementById("competitionHistory");

// Função para salvar os dados em um arquivo JSON
function saveDataToJSON() {
  try {
    // Organizando os dados a serem salvos no arquivo JSON
    const dataToSave = {
      tasks: tasks,  // Lista de tarefas
      activities: activities,  // Lista de atividades
      streak: streak,  // Sequência de dias
      completedTasksHistory: completedTasksHistory  // Histórico de tarefas concluídas
    };

    // Criar o objeto Blob para gerar o arquivo JSON
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);  // Cria um link temporário para o arquivo
    const link = document.createElement('a');  // Cria um link para download
    link.href = url;
    link.download = 'settings.json';  // Nome do arquivo a ser baixado
    link.click();  // Inicia o download
    URL.revokeObjectURL(url);  // Limpa o URL temporário

    console.log('Dados salvos no arquivo JSON:', dataToSave);
  } catch (error) {
    console.error('Erro ao salvar dados no arquivo JSON:', error);
  }
}



// Função para atualizar o progresso do streak
function updateStreak() {
  streakCount.textContent = `Sequência: ${streak} dias`;
  const percentage = Math.min(streak * 2, 100); // Multiplica o streak por 2 para permitir mais dias, com limite de 100%
  streakBar.style.width = `${percentage}%`;
}

// Função para renderizar a lista de tarefas
function renderTasks() {
  Object.keys(taskLists).forEach(key => {
    taskLists[key].innerHTML = '';
  });

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.classList.toggle('completed', task.completed);
    li.innerHTML = `
      <span>${task.name}</span>
      <button onclick="toggleTaskCompletion(${index})">${task.completed ? 'Desmarcar' : 'Concluir'}</button>
    `;
    taskLists[task.tag].appendChild(li);
  });

  updateStreak();
}

// Função para adicionar uma nova tarefa
function addTask() {
  const taskName = taskInput.value.trim();
  const tag = tagSelect.value;

  if (taskName === '') {
    taskInput.classList.add('error');
    return;
  } else {
    taskInput.classList.remove('error');
  }

  const newTask = { name: taskName, tag: tag, completed: false };
  tasks.push(newTask);
  taskInput.value = '';
  renderTasks();
}

// Função para marcar a tarefa como concluída ou desmarcar
function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed;  // Altera o estado de conclusão
  if (tasks[index].completed) {
    tasks[index].completionDate = new Date().toISOString().split('T')[0]; // Adiciona a data de conclusão
  }

  renderTasks();  // Re-renderiza as tarefas
}

// Adicione isto ao início do código, se estiver no ambiente do navegador:
if (typeof require !== 'undefined') {
  const fs = require('fs'); // Importa o módulo fs do Node.js
}


function finishDay() {
  if (tasks.length === 0) {
    alert('Você não adicionou nenhuma tarefa para hoje!');
    return;
  }

  const allCompleted = tasks.every(task => task.completed);

  if (allCompleted) {
    streak++;
    alert('Parabéns! Você completou todas as tarefas do dia!');
    if (streak % 5 === 0) {
      alert(`Parabéns! Você completou ${streak} dias consecutivos! Continue assim! 🎉`);
    }
  } else {
    streak = 0;
    alert('Ainda há tarefas não concluídas! A sequência de dias foi resetada.');
  }

  // Salva o novo streak no localStorage
  localStorage.setItem('streak', streak);

  // Adiciona as tarefas concluídas ao histórico
  const completedTasksForToday = tasks.filter(task => task.completed).map(task => ({
    name: task.name,
    tag: task.tag,
    completionDate: task.completionDate || new Date().toISOString().split('T')[0]
  }));
  
  if (completedTasksForToday.length > 0) {
    completedTasksHistory.push({
      date: new Date().toISOString().split('T')[0],
      completedTasks: completedTasksForToday
    });

    // Salva o histórico no localStorage
    localStorage.setItem('completedTasksHistory', JSON.stringify(completedTasksHistory));
  }

  tasks = [];  // Limpa as tarefas do dia
  renderTasks();
  updateStreak();

  // Salva os dados no arquivo JSON usando Node.js
  saveDataToFile();
}

// Evento de clique do botão de finalizar o dia
finishDayBtn.addEventListener('click', finishDay);

// Função para obter a quantidade de dias concluídos por tipo de atividade
function getCompletedDaysByType() {
  const completedDaysStats = {
    saude: new Set(),
    estudo: new Set(),
    lazer: new Set(),
    trabalho: new Set(),
    outros: new Set()
  };

  // Contar as tarefas concluídas por tipo e associar ao dia (data)
  tasks.forEach(task => {
    if (task.completed && task.completionDate) {
      const day = task.completionDate;  // Obtém a data de conclusão da tarefa
      if (task.tag === 'saude') completedDaysStats.saude.add(day);
      if (task.tag === 'estudo') completedDaysStats.estudo.add(day);
      if (task.tag === 'lazer') completedDaysStats.lazer.add(day);
      if (task.tag === 'trabalho') completedDaysStats.trabalho.add(day);
      if (task.tag === 'outros') completedDaysStats.outros.add(day);
    }
  });

  // Contar as atividades concluídas por tipo e associar ao dia (data)
  activities.forEach(activity => {
    if (activity.completed && activity.date) {
      const day = activity.date;  // Obtém a data da atividade
      const activityTag = activity.tag || 'outros'; // Garantir que a tag esteja disponível, ou use 'outros'
      if (activityTag === 'saude') completedDaysStats.saude.add(day);
      if (activityTag === 'estudo') completedDaysStats.estudo.add(day);
      if (activityTag === 'lazer') completedDaysStats.lazer.add(day);
      if (activityTag === 'trabalho') completedDaysStats.trabalho.add(day);
      if (activityTag === 'outros') completedDaysStats.outros.add(day);
    }
  });

  // Agora, cada chave em completedDaysStats terá um Set com as datas únicas em que as atividades foram concluídas
  return {
    saude: completedDaysStats.saude.size,
    estudo: completedDaysStats.estudo.size,
    lazer: completedDaysStats.lazer.size,
    trabalho: completedDaysStats.trabalho.size,
    outros: completedDaysStats.outros.size
  };
}

// Exibe estatísticas de atividade, incluindo o número de dias concluídos por tipo de atividade
function displayActivityStats() {
  // Exibir o streak (sequência de dias)
  const streakItem = document.createElement("li");
  streakItem.textContent = `Sequência de Dias Concluídos: ${streak} dias`;

  // Obter dados detalhados de atividades concluídas por dia
  const completedDaysByType = getCompletedDaysByType();

  // Exibir frequência de cada tipo de atividade
  const activityData = {
    labels: ["Saúde", "Estudo", "Lazer", "Trabalho", "Outros"],
    data: [
      tasks.filter(task => task.tag === "saude" && task.completed).length,
      tasks.filter(task => task.tag === "estudo" && task.completed).length,
      tasks.filter(task => task.tag === "lazer" && task.completed).length,
      tasks.filter(task => task.tag === "trabalho" && task.completed).length,
      tasks.filter(task => task.tag === "outros" && task.completed).length
    ]
  };

  activityData.labels.forEach((activity, index) => {
    const frequency = activityData.data[index];
    const completedDays = completedDaysByType[activity.toLowerCase()];

    const listItem = document.createElement("li");
    listItem.textContent = `${activity}: ${frequency} tarefas concluídas (${completedDays} dias concluídos neste tipo de atividade)`;
  });
}

// Evento de clique do botão de adicionar tarefa
addTaskBtn.addEventListener('click', addTask);

// Evento de clique do botão de finalizar o dia
finishDayBtn.addEventListener('click', finishDay);

// Evento de clique para salvar os dados
document.getElementById('save-btn').addEventListener('click', saveDataToJSON);

// Carregar os dados da página ao iniciar
renderTasks();
displayActivityStats();
updateStreak();
