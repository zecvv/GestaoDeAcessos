// js/gerarQrCode.js
window.gerarQRCode = function (container, dados) {
  container.innerHTML = "";

  new QRCode(container, {
    text: JSON.stringify(dados),
    width: 180,
    height: 180,
    correctLevel: QRCode.CorrectLevel.L
  });
};