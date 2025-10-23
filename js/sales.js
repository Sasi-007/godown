import { db } from "./firebase.js";
import { addDoc, collection, getDocs, deleteDoc, doc, query } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { loadData } from "./script.js";
import { getAvailableStock, loadStockStatus } from "./stock.js";

export let salesData = [];

const saleForm = document.getElementById("saleForm");
const saleItem = document.getElementById("saleItem");
const saleQuantity = document.getElementById("saleQuantity");
const salePrice = document.getElementById("salePrice");
const salesList = document.getElementById("salesList");
const deleteSalesBtn = document.getElementById("deleteSalesBtn");

deleteSalesBtn.addEventListener("click", async () => {
  if (!confirm("Delete ALL sales?")) return;
  const q = query(collection(db, "sales"));
  const snapshot = await getDocs(q);
  const deletions = snapshot.docs.map(d => deleteDoc(doc(db, "sales", d.id)));
  await Promise.all(deletions);
  alert("All sales deleted.");
  await loadData();
});

export async function loadSales() {
  salesData = [];
  salesList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "sales"));
  snapshot.forEach(d => salesData.push({ id: d.id, ...d.data() }));
  salesData.sort((a, b) => new Date(b.date) - new Date(a.date));
  salesData.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.product}</td><td>${d.qty}</td><td>₹${d.salePrice}</td><td>${new Date(d.date).toLocaleString()}</td><td><button class="delete-btn" data-id="${d.id}">Delete</button></td>`;
    salesList.appendChild(tr);
  });
  salesList.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", e => deleteSale(e.target.dataset.id)));
  loadStockStatus();
}

async function deleteSale(id) {
  if (!confirm("Delete this sale?")) return;
  await deleteDoc(doc(db, "sales", id));
  await loadData();
}

saleForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = saleItem.value;
  const qty = parseInt(saleQuantity.value, 10);
  const price = parseFloat(salePrice.value);
  if (!name || isNaN(qty) || qty < 1 || isNaN(price)) return alert("Invalid input");
  const available = getAvailableStock(name);
  if (qty > available) return alert(`Only ${available} available.`);
  await addDoc(collection(db, "sales"), { product: name, qty, salePrice: price, date: new Date().toISOString() });
  saleForm.reset();
  await loadData();
});
