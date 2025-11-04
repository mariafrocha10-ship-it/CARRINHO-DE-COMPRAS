addEventListener
const produtosEl = document.getElementById("produtos");
const carrinhoEl = document.getElementById("itens-carrinho");
const totalEl = document.getElementById("total");
let carrinho = [];

// ======== 1️ Buscar produtos da API ========
fetch("https://fakestoreapi.com/products")
  .then(res => res.json())
  .then(data => exibirProdutos(data))
  .catch(err => console.error("Erro na API:", err));

function exibirProdutos(produtos) {
  produtosEl.innerHTML = "";
  produtos.forEach(prod => {
    const card = document.createElement("div");
    card.classList.add("produto");
    card.innerHTML = `
      <img src="${prod.image}" alt="${prod.title}">
      <h3>${prod.title}</h3>
      <p>${prod.description.substring(0, 70)}...</p>
      <strong>R$ ${prod.price.toFixed(2)}</strong><br>
      <button onclick="adicionarCarrinho(${prod.id}, '${prod.title}', ${prod.price})">Adicionar</button>
    `;
    produtosEl.appendChild(card);
  });
}

// ======== 2️ Gerenciar carrinho ========
function adicionarCarrinho(id, nome, preco) {
  const item = carrinho.find(i => i.id === id);
  if (item) {
    item.qtd++;
  } else {
    carrinho.push({ id, nome, preco, qtd: 1 });
  }
  atualizarCarrinho();
}

function atualizarCarrinho() {
  carrinhoEl.innerHTML = "";
  let total = 0;

  carrinho.forEach(item => {
    total += item.preco * item.qtd;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nome} (x${item.qtd})
      <button onclick="removerItem(${item.id})"></button>
    `;
    carrinhoEl.appendChild(li);
  });

  totalEl.textContent = `Total: R$ ${total.toFixed(2)}`;
}

function removerItem(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  atualizarCarrinho();
}

// ======== 3️ CEP e Mapa ========
const buscarCEPBtn = document.getElementById("buscarCEP");
const cepInput = document.getElementById("cep");

let mapa, marcador, destino;

buscarCEPBtn.addEventListener("click", () => {
  const cep = cepInput.value.replace("-", "").trim();
  if (!cep) return alert("Digite um CEP válido!");

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(res => res.json())
    .then(data => {
      if (data.erro) return alert("CEP não encontrado!");
      mostrarMapa(data);
    })
    .catch(() => alert("Erro ao buscar CEP"));
});

function mostrarMapa(endereco) {
  // ====== Localização aproximada via Nominatim ======
  const local = `${endereco.logradouro}, ${endereco.localidade}, ${endereco.uf}`;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${local}`)
    .then(res => res.json())
    .then(coords => {
      if (!coords[0]) return alert("Não foi possível localizar o endereço.");

      const lat = parseFloat(coords[0].lat);
      const lon = parseFloat(coords[0].lon);
      destino = [lat, lon];

      if (!mapa) {
        mapa = L.map("mapa").setView(destino, 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapa);
      }

      if (marcador) marcador.remove();
      marcador = L.marker(destino).addTo(mapa)
        .bindPopup(`📍 ${endereco.logradouro}, ${endereco.localidade}`)
        .openPopup();
    });
}

