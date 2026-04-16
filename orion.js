const gravedad = 9.81;
const AreaFrontalCapsula = 12;
let simIntervalo = null;
let tiempoSimulacion = 0;
let alturaSimulacion = 0;
let velocidadSimulacion = 0;
let masaSimulacion = 9300;
let coeficienteSimulacion = 1.2;
let paracaidasAltitudSimulacion = 7000;
let altitudInicialSimulacion = 120000;
let paracaidasDesplegado = false;
let EkDatos = [];
let EpDatos = [];
let tiempoLabels = [];
let cuadroEnergia = null;

function rho(altura) {
    if (altura > 80000) return 0.00001;
    if (altura > 50000) return 0.001;
    if (altura > 20000) return 0.05;
    if (altura > 10000) return 0.4;
    if (altura > 5000)  return 0.7;
    return 1.2;
}

function getParametros() {
    altitudInicialSimulacion = parseFloat(document.getElementById('alt').value) * 1000;
    masaSimulacion           = parseFloat(document.getElementById('masa').value);
    coeficienteSimulacion    = parseFloat(document.getElementById('cd').value);
    paracaidasAltitudSimulacion = parseFloat(document.getElementById('para-alt').value) * 1000;
}

document.getElementById('alt').oninput = function() {
    document.getElementById('alt-out').textContent = this.value;
    actualizarMetricas();
};

document.getElementById('masa').oninput = function() {
    document.getElementById('masa-out').textContent = this.value;
    actualizarMetricas();
};

document.getElementById('cd').oninput = function() {
    document.getElementById('cd-out').textContent = parseFloat(this.value).toFixed(1);
};

document.getElementById('para-alt').oninput = function() {
    document.getElementById('para-out').textContent = parseFloat(this.value).toFixed(1);
};

function actualizarMetricas() {
    const h    = parseFloat(document.getElementById('alt').value) * 1000;
    const masa = parseFloat(document.getElementById('masa').value);
    const ep   = masa * gravedad * h;
    document.getElementById('ep-val').textContent  = (ep / 1e9).toFixed(2);
    document.getElementById('ek-val').textContent  = '0.00';
    document.getElementById('vel-val').textContent = '0';
    document.getElementById('fase-val').innerHTML  = '<span class="phase-badge phase-caida">En reposo</span>';
}

function iniciarCuadro() {
    if (cuadroEnergia) { cuadroEnergia.destroy(); cuadroEnergia = null; }
    EkDatos = []; EpDatos = []; tiempoLabels = [];
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    cuadroEnergia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tiempoLabels,
            datasets: [
                { label: 'Ek (GJ)', data: EkDatos, borderColor: '#378add', backgroundColor: 'rgba(55,138,221,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.3 },
                { label: 'Ep (GJ)', data: EpDatos, borderColor: '#d85a30', backgroundColor: 'rgba(216,90,48,0.08)',  borderWidth: 2, pointRadius: 0, tension: 0.3 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            scales: {
                x: { ticks: { maxTicksLimit: 8, color: '#888', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
                y: { ticks: { color: '#888', font: { size: 11 }, callback: v => v.toFixed(1) }, grid: { color: 'rgba(0,0,0,0.06)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function dibujarCanvas(h, v, deployed) {
    const canvas = document.getElementById('simCanvas');
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 80; i++) {
        const sx = (i * 137.5) % W;
        const sy = (i * 97.3)  % (H * 0.7);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI * 2); ctx.fill();
    }

    const groundY = H - 65;
    ctx.fillStyle = '#0d2b4e';
    ctx.fillRect(0, groundY, W, H - groundY);

    const frac  = Math.max(0, Math.min(1, 1 - h / altitudInicialSimulacion));
    const capsY = 30 + frac * (groundY - 47);
    const capsX = W / 2;

    if (v > 2000 && !deployed) {
        const hg = ctx.createRadialGradient(capsX, capsY + 18, 2, capsX, capsY + 18, 28);
        hg.addColorStop(0,   'rgba(255,220,80,0.7)');
        hg.addColorStop(0.5, 'rgba(255,100,20,0.4)');
        hg.addColorStop(1,   'rgba(255,50,0,0)');
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.ellipse(capsX, capsY + 22, 28, 18, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#c8d8f0';
    ctx.beginPath();
    ctx.moveTo(capsX - 14, capsY + 16);
    ctx.lineTo(capsX + 14, capsY + 16);
    ctx.lineTo(capsX + 10, capsY);
    ctx.lineTo(capsX - 10, capsY);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a0b4cc';
    ctx.beginPath(); ctx.arc(capsX, capsY, 10, Math.PI, 0); ctx.closePath(); ctx.fill();

    if (deployed) {
        for (let i = 0; i < 5; i++) {
            const px = capsX - 40 + i * 20;
            const py = capsY - 60 + Math.sin(i * 1.2) * 10;
            ctx.strokeStyle = 'rgba(220,220,220,0.6)'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(capsX + (i - 2) * 4, capsY); ctx.lineTo(px, py); ctx.stroke();
            const pg = ctx.createRadialGradient(px, py - 12, 0, px, py - 12, 22);
            pg.addColorStop(0, 'rgba(220,100,50,0.9)');
            pg.addColorStop(1, 'rgba(180,60,20,0.2)');
            ctx.fillStyle = pg;
            ctx.beginPath(); ctx.ellipse(px, py - 12, 18, 14, Math.sin(i) * 0.2, 0, Math.PI * 2); ctx.fill();
        }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '11px monospace';
    ctx.fillText('Alt: ' + (h / 1000).toFixed(1) + ' km', 10, 20);
    ctx.fillText('Vel: ' + v.toFixed(0) + ' m/s', 10, 35);
}

function iniciarSim() {
    if (simIntervalo) return;
    getParametros();
    alturaSimulacion     = altitudInicialSimulacion;
    velocidadSimulacion  = 0;
    tiempoSimulacion     = 0;
    paracaidasDesplegado = false;
    iniciarCuadro();
    actualizarMetricas();

    const dt = 0.5;
    simIntervalo = setInterval(() => {
        tiempoSimulacion += dt;
        const dens       = rho(alturaSimulacion);
        const cdEfectivo = paracaidasDesplegado ? coeficienteSimulacion * 18 : coeficienteSimulacion;
        const Fdrag      = 0.5 * dens * velocidadSimulacion * velocidadSimulacion * cdEfectivo * AreaFrontalCapsula;
        const acc        = (masaSimulacion * gravedad - Fdrag) / masaSimulacion;
        velocidadSimulacion += acc * dt;
        if (velocidadSimulacion < 0) velocidadSimulacion = 0;
        alturaSimulacion -= velocidadSimulacion * dt;
        if (alturaSimulacion <= paracaidasAltitudSimulacion && !paracaidasDesplegado) paracaidasDesplegado = true;

        const ep = masaSimulacion * gravedad * alturaSimulacion;
        const ek = 0.5 * masaSimulacion * velocidadSimulacion * velocidadSimulacion;

        document.getElementById('ep-val').textContent  = (ep / 1e9).toFixed(2);
        document.getElementById('ek-val').textContent  = (ek / 1e9).toFixed(2);
        document.getElementById('vel-val').textContent = velocidadSimulacion.toFixed(0);

        let faseHTML = alturaSimulacion <= 0
            ? '<span class="phase-badge phase-amerizado">Amerizada</span>'
            : paracaidasDesplegado
                ? '<span class="phase-badge phase-paracaidas">Paracaídas</span>'
                : '<span class="phase-badge phase-caida">Caída libre</span>';
        document.getElementById('fase-val').innerHTML = faseHTML;

        if (tiempoSimulacion % 5 < dt) {
            tiempoLabels.push(tiempoSimulacion.toFixed(0) + 's');
            EkDatos.push(parseFloat((ek / 1e9).toFixed(3)));
            EpDatos.push(parseFloat((ep / 1e9).toFixed(3)));
            cuadroEnergia.update('none');
        }

        dibujarCanvas(alturaSimulacion, velocidadSimulacion, paracaidasDesplegado);

        if (alturaSimulacion <= 0) {
            alturaSimulacion    = 0;
            velocidadSimulacion = 0;
            clearInterval(simIntervalo);
            simIntervalo = null;
        }
    }, 50);
}

function reiniciarSim() {
    if (simIntervalo) { clearInterval(simIntervalo); simIntervalo = null; }
    getParametros();
    alturaSimulacion     = altitudInicialSimulacion;
    velocidadSimulacion  = 0;
    tiempoSimulacion     = 0;
    paracaidasDesplegado = false;
    dibujarCanvas(altitudInicialSimulacion, 0, false);
    actualizarMetricas();
    iniciarCuadro();
}

actualizarMetricas();
dibujarCanvas(120000, 0, false);
iniciarCuadro();