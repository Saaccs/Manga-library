let data = [];
let filteredData = [];
let currentFilter = "all";

let currentPage = 1;
const perPage = 50;

fetch("/data")
  .then(res => res.json())
  .then(json => {
    data = json;
    applyFilters();
  });

// render
function render() {
  const container = document.getElementById("list");
  container.innerHTML = "";

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  const pageItems = filteredData.slice(start, end);

  pageItems.forEach(manga => {
    container.innerHTML += `
      <div class="card">
        <img src="/${manga.cover}" loading="lazy"
             onerror="this.src='/noImage.webp'">

        <h3>${manga.title}</h3>

        <button onclick="toggleFollow(${manga.id}, ${!manga.followed})">
          ${manga.followed ? "⭐ Siguiendo" : "☆ Seguir"}
        </button>

        <textarea onchange="updateDescription(${manga.id}, this.value)">
${manga.description || ""}
        </textarea>
      </div>
    `;
  });

  updatePagination();
  document.getElementById("pageInput").value = currentPage;
}

// ⭐ FIX REAL
function toggleFollow(id, state) {
  fetch("/toggle_follow", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ id: id, followed: state })
  }).then(() => {
    const manga = data.find(m => m.id == id);
    manga.followed = state;
    render();
  });
}

// descripción
function updateDescription(id, value) {
  fetch("/update_description", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ id: id, description: value })
  });
}

// añadir
function addManga() {
  const title = document.getElementById("newTitle").value;
  const file = document.getElementById("newImage").files[0];

  if (!title || !file) {
    alert("Nombre e imagen obligatorios");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("image", file);

  fetch("/add", {
    method: "POST",
    body: formData
  }).then(() => location.reload());
}

// ⭐ mantener seguidos
function keepOnlyFollowed() {
  const confirmDelete = prompt("Escribe OK para dejar solo favoritos");

  if (confirmDelete !== "OK") return;

  fetch("/keep_followed", {
    method: "POST"
  }).then(() => location.reload());
}

// paginación
function updatePagination() {
  const totalPages = Math.ceil(filteredData.length / perPage) || 1;

  document.getElementById("pageInfo").innerText =
    `Página ${currentPage} / ${totalPages}`;

  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage === totalPages;

  document.getElementById("pageInput").max = totalPages;
}

document.getElementById("prevBtn").onclick = () => {
  currentPage--;
  render();
};

document.getElementById("nextBtn").onclick = () => {
  currentPage++;
  render();
};

document.getElementById("pageInput").addEventListener("change", function () {
  let page = parseInt(this.value);
  const totalPages = Math.ceil(filteredData.length / perPage) || 1;

  if (isNaN(page) || page < 1) page = 1;
  if (page > totalPages) page = totalPages;

  currentPage = page;
  render();
});

// filtros
document.getElementById("allBtn").onclick = () => {
  currentFilter = "all";
  applyFilters();
};

document.getElementById("followedBtn").onclick = () => {
  currentFilter = "followed";
  applyFilters();
};

// búsqueda
document.getElementById("search").addEventListener("input", applyFilters);

// aplicar filtros
function applyFilters() {
  const value = document.getElementById("search").value.toLowerCase();

  filteredData = data;

  if (currentFilter === "followed") {
    filteredData = filteredData.filter(m => m.followed);
  }

  filteredData = filteredData.filter(m =>
    m.title.toLowerCase().includes(value)
  );

  currentPage = 1;
  render();
}