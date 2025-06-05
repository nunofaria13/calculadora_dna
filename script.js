let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

/* Checkpoints da barra de progresso */
function goToSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
    // Esconder resultados se estiverem visíveis
    document.getElementById('results').style.display = 'none';
    document.getElementById('chart-container').style.display = 'none';
    document.getElementById('eco-tip').style.display = 'none';
    document.getElementById('slides').style.display = 'block';
}

function startQuiz() {
    document.getElementById('home').style.display = 'none';
    showSlide(0);
}

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        slide.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });

    });
    slides[index].style.display = 'block';
    setTimeout(() => {
        slides[index].classList.add('active');
    }, 10);
    updateProgressBar(index);
    revealCheckpoints(index);
}

function revealCheckpoints(currentIndex) {
    const checkpoints = [0, 4, 9, 13, 17, 21];
    checkpoints.forEach(i => {
        const cp = document.getElementById(`cp-${i}`);
        if (cp && currentIndex >= i) {
            cp.classList.add('visible');
        }
    });
}

function nextSlide() {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
    } else {
        document.getElementById('home').style.display = 'block';
        slides[currentSlide].style.display = 'none';
    }
}

function updateProgressBar(index) {
    const progress = ((index + 1) / slides.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

/* Atribuição de valores às respostas abertas */
function classificarQ11(valor) {
    if (valor <= 5) return 0;
    if (valor <= 10) return 1;
    if (valor <= 15) return 2;
    if (valor <= 20) return 3;
    return 4;
}

function calcularImpactoDeslocacao() {
    const pessoas = parseFloat(document.getElementById('q1').value) || 0;
    const distancia = parseFloat(document.getElementById('q2').value) || 0;
    const veiculos = parseInt(document.getElementById('q4').value) || 0;
    const tipo = parseInt(document.getElementById('q3').value) || 0;

    const fatores = {
        0: 0.00, // Bicicleta/A pé
        1: 0.03, // Comboio
        2: 0.05, // Autocarro
        3: 0.21  // Veículo particular
    };

    if (pessoas === 0 || veiculos === 0) return 0;

    const impacto = (distancia / (pessoas * veiculos)) * (fatores[tipo] || 0);

    // Normalizar para escala de 0 a 4
    if (impacto <= 0.05) return 0;
    if (impacto <= 0.10) return 1;
    if (impacto <= 0.20) return 2;
    if (impacto <= 0.30) return 3;
    return 4;
}

function showResults() {
    const q11Value = parseFloat(document.getElementById('q11').value);
    if (isNaN(q11Value)) {
        alert("Por favor, insere um número válido para a quantidade consumida.");
        return;
    }

    let q1 = parseFloat(document.getElementById('q1').value) || 1; // número de participantes
    let q2 = parseFloat(document.getElementById('q2').value) || 0;
    let q4Original = parseFloat(document.getElementById('q4').value) || 0;
    let q11 = parseFloat(document.getElementById('q11').value) || 0;

    // Evitar divisão por zero
    let consumoPorPessoa = q1 > 0 ? q11 / q1 : 0;

    // Classificar com base no consumo por pessoa
    let scoreQ11 = classificarQ11(consumoPorPessoa);

    let tipoTransporte = parseInt(document.getElementById('q3').value) || 0;
    // Declarar variáveis por categoria
    let impactoDeslocacao = calcularImpactoDeslocacao();
    let q4 = Math.min(Math.max(parseInt(q4Original), 0), 3);
    let deslocacoes = impactoDeslocacao;

    let tipologia = 0;
    tipologia += parseInt(document.getElementById('q5').value) || 0;
    tipologia += parseInt(document.getElementById('q6').value) || 0;
    tipologia += parseInt(document.getElementById('q7').value) || 0;
    tipologia += parseInt(document.getElementById('q8').value) || 0;

    let alimentacao = scoreQ11;
    alimentacao += parseInt(document.getElementById('q9').value) || 0;
    alimentacao += parseInt(document.getElementById('q10').value) || 0;

    let agua = 0;
    agua += parseInt(document.getElementById('q12').value) || 0;
    agua += parseInt(document.getElementById('q13').value) || 0;
    agua += parseInt(document.getElementById('q14').value) || 0;

    let energia = 0;
    energia += parseInt(document.getElementById('q15').value) || 0;
    energia += parseInt(document.getElementById('q16').value) || 0;
    energia += parseInt(document.getElementById('q17').value) || 0;

    let residuos = 0;
    residuos += parseInt(document.getElementById('q18').value) || 0;
    residuos += parseInt(document.getElementById('q19').value) || 0;
    residuos += parseInt(document.getElementById('q20').value) || 0;

    // Calcular total
    let total = deslocacoes + tipologia + alimentacao + agua + energia + residuos;

    let message = "";
    if (total < 10) {
        message = "baixa";
    } else if (total < 20) {
        message = "moderada";
    } else {
        message = "alta";
    }

    document.getElementById('slides').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('result').innerText = `O teu valor é de ${total}, logo, a tua Ponderação é ${message}`;
    document.getElementById('resultCO').innerHTML += `<br><br>🚗 Emissões de deslocação: <strong>${impactoDeslocacao} kg CO₂</strong>`;

    // Gerar gráfico circular
    const ctx = document.getElementById('footprintChart').getContext('2d');
    window.footprintChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Deslocações', 'Tipologia de Atividade', 'Alimentação', 'Água', 'Energia', 'Resíduos'],
            datasets: [{
                data: [deslocacoes, tipologia, alimentacao, agua, energia, residuos],
                backgroundColor: ['#FFA500', '#868686', '#2E8B57', '#4682B4', '#FFD700', '#800080'],
                hoverOffset: 10
            }]
        }
    });

    // Determinar a área com maior pontuação
    const categorias = ['Deslocações', 'Tipologia de Atividade', 'Alimentação', 'Água', 'Energia', 'Resíduos'];
    const valores = [deslocacoes, tipologia, alimentacao, agua, energia, residuos];
    const indiceMax = valores.indexOf(Math.max(...valores));
    const categoriaMaisAlta = categorias[indiceMax];

    // Mensagens personalizadas por categoria
    const dicas = {
        'Deslocações': "🚶‍♀️ Considera reduzir o uso de transporte individual. Partilhar boleias ou usar transportes públicos pode fazer uma grande diferença!",
        'Tipologia de Atividade': "📦 Pensa em formas de tornar as tuas atividades mais sustentáveis, como reutilizar materiais ou evitar merchandising desnecessário.",
        'Alimentação': "🥦 Opta por alimentos locais, biológicos e com menos embalagens. Pequenas escolhas fazem grande impacto!",
        'Água': "💧 Reutilizar água e usar métodos de lavagem mais eficientes ajuda a conservar este recurso precioso.",
        'Energia': "🔋 Explora formas de usar energias renováveis e reduzir o consumo energético nas tuas atividades.",
        'Resíduos': "♻️ Reduz, reutiliza e recicla sempre que possível. Uma boa separação de resíduos é essencial!"
    };

    // Mostrar dica
    document.getElementById('eco-tip').innerText = `💡 Dica: ${dicas[categoriaMaisAlta]}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}