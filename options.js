
const listEl  = document.getElementById("list");
const saveBtn = document.getElementById("save");
const status  = document.getElementById("status");

/* populate on load */
chrome.storage.sync.get({ sites: [] }, ({ sites }) => {
  listEl.value = sites.join("\n");
});

/* save save save save  */
saveBtn.onclick = () => {
  const sites = listEl.value
    .split(/\s+/)
    .filter(Boolean)
    .map(s => s.toLowerCase().replace(/^www\./, ''));
  chrome.storage.sync.set({ sites }, () => {
    status.textContent = "Saved ✔";
    setTimeout(() => (status.textContent = ""), 1500);
  });
};

