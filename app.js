let data = [];

fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    render(data);
  });

function render(list) {
  const container = document.getElementById("list");
  container.innerHTML = "";

  list.forEach(m => {
    container.innerHTML += `
      <div class="card">
        <img src="${m.cover}" width="100">
        <h3>${m.title}</h3>
        <a href="${m.url}" target="_blank">Ver</a>
        <p>${m.status}</p>
      </div>
    `;
  });
}

document.getElementById("search").addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  const filtered = data.filter(m =>
    m.title.toLowerCase().includes(value)
  );
  render(filtered);
});
