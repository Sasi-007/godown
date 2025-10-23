import { purchasesData, loadPurchases } from "./purchases.js";

const tabButtons = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll("section");

tabButtons.forEach(btn => btn.addEventListener("click", () => {
  tabButtons.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  sections.forEach(sec => sec.style.display = "none");
  document.getElementById(btn.dataset.target).style.display = "block";
}));

document.getElementById("purchaseSearch").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  const filtered = purchasesData.filter(p => p.product.toLowerCase().includes(term));
  const purchaseCardList = document.getElementById("purchaseCardList");
  purchaseCardList.innerHTML = "";
  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "purchase-card";
    card.innerHTML = `<div>${p.product}</div>`;
    purchaseCardList.appendChild(card);
  });
});

sections.forEach(sec => sec.style.display = "none");
document.getElementById("purchaseSection").style.display = "block";
