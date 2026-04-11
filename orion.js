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


