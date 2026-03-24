function calcular() {
  let horas = document.getElementById("horas").value;
  let resultado = document.getElementById("resultado");

  // Verifica se o campo está vazio
  if (horas === "") {
    resultado.innerText = "Digite as horas da máquina!";
    return;
  }

  horas = Number(horas);

  if (horas < 250) {
    resultado.innerText = "Próxima revisão: 250 horas";
  } else if (horas < 500) {
    resultado.innerText = "Próxima revisão: 500 horas";
  } else if (horas < 1000) {
    resultado.innerText = "Próxima revisão: 1000 horas (revisão mais completa)";
  } else {
    resultado.innerText = "Revisão geral necessária! Verificar todos os sistemas.";
  }
}