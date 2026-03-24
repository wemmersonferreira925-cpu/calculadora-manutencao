function calcular() {
    let horas = document.getElementById("horas").value;

    if (horas === "" || horas <= 0) {
        document.getElementById("resultado").innerHTML = "Digite um valor válido!";
        return;
    }

    horas = parseInt(horas);

    let proximaTrocaOleo = Math.ceil(horas / 250) * 250;
    let proximoFiltro = Math.ceil(horas / 500) * 500;

    let alerta = "";

    if (horas >= proximaTrocaOleo - 10) {
        alerta += "⚠️ Atenção: Troca de óleo próxima!<br>";
    }

    if (horas >= proximoFiltro - 20) {
        alerta += "⚠️ Atenção: Troca de filtro próxima!<br>";
    }

    document.getElementById("resultado").innerHTML = `
        <p>🛢 Próxima troca de óleo: <strong>${proximaTrocaOleo}h</strong></p>
        <p>🔧 Próxima troca de filtro: <strong>${proximoFiltro}h</strong></p>
        <br>
        ${alerta}
    `;
}
