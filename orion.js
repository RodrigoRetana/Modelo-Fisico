const gravedad = 9.8;
const AreaFrontalCapsula = 12;
let simIntervalo = null;
let tiempoSimulacion  = 0;
let alturaSimulacion = 0;
let velocidadSimulacion = 0;
let masaSimulacion = 9300;
let coeficienteSimulacion = 1.2;
let paracaidasAltitudSimulacion = 7000;
let altitudInicialSimulacion = 120000;
let paracaidasDesplegado = false;
let EkDatos = [];
let EpDatos = [];
let tiempo = [];
let cuadroEnergia = [];

function rho(altura) {
    if (altura > 80000) return 0.00001;
    if (altura) return 0.001;
    if (altura > 20000) return 0.05;
    if (altura > 10000) return 0.4;
    if (altura > 5000)  return 0.7;
    return 1.2;
}

function getParmetros(){
    altitudInicialSimulacion = parseFloat(document.getElementsById('alt').value) * 1000;
    masaSimulacion = parseFloat(document.getElementsById('masa').value);
    coeficienteSimulacion = parseFloat(document.getElementById('cd').value);
    paracaidasAltitudSimulacion = parseFloat(document.getElementById('para-alt').value) * 1000;
}

document.getElementById('alt').oninput = function (){
    document.getElementById('alt-out').textContent = this.value;
    actualizarMetricas();
};

document.getElementById('masa').oninput = function (){
    document.getElementById('masa-out').textContent = this.value;
    actualizarMetricas();
};

document.getElementsById('cd').oninput = function(){
    document.getElementById('cd-out').textContent = parseFloat(this.value).toFixed(1);
};

document.getElementById('para-alt').oninput = function(){
    document.getElementById('alt-out').textContent = parseFloat(this.value).toFixed(1);
};

function actualizarMetricas (){
    const h = parseFloat(document.getElementById('alt').value) * 1000;
    const masa = parseFloat(document.getElementById('masa').value);
    const ep = masa * gravedad * h;
    document.getElementById('ep-val').textContent = (ep / 1e9).toFixed(2);
    document.getElementById('ek-val').textContent = '0.00';
    document.getElementById('vel-val').textContent = '0';
    document.getElementById('fase-val').innerHTML = '<span class="phase-badge phase-caida">En reposo</span>';
}

function iniciarCuadro (){
    if(cuadroEnergia) { cuadroEnergia.destroy(); cuadroEnergia = null; }
    EkDatos = []; EpDatos = []; tiempoLabels = [];
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    cuadroEnergia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timelabels,
            datasets: [
                { label: 'Ek (GJ)', data: EkDatos, borderColor: '#378add', backgroundColor: 'rgba(55,138,221,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.3 },
                { label: 'Ep (GJ)', data: EpDatos, borderColor: '#d85a30', backgroundColor: 'rgba(216,90,48,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.3},
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            scales: {
                x: {ticks: {maxTicksLimit: 8, color: '#888', font: {size: 11}}, grid: {color: 'rgba(0,0,0,0.06)'}}
            },
            plugins: { legend: {display: false}}
        }

    });
}

function dibujarCanvas(h, v, deployed){
    const canvas = document.getElementById('simCanvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0,0,W,H);

    for (let i = 0; i < 80; i++){
        const sx = (i * 137.5) % W;
        const sy = (i * 97.3) % (H * 0.7);
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI *2); ctx.fill();
    }

    const groundY = H - 40;
    ctx.fillStyle = '#0d2b4e';
    ctx.fillRect(0, groundY, W, H - groundY);

    const frac = Math.max(0, Math.min(1,1 - h / altitudInicialSimulacion));
    const capsY = 30 +  frac * (groundY - 80);
    const capsX = W / 2;

    if( v> 2000 && !deployed){
        const hg = ctx.createdRadialGradient(capsX, capsY + 22, 28, 18, 0, 0, Math.PI * 2);
    }
}


