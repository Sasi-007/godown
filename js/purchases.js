import { db } from "./firebase.js";
import { addDoc, collection, getDocs, deleteDoc, doc, query } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { loadData } from "./script.js";
import { populateSaleItems, loadStockStatus } from "./stock.js";

export let purchasesData = [];

const product = document.querySelector("#product");
const qty = document.querySelector("#qty");
const rate = document.querySelector("#rate");
const saveBtn = document.querySelector("#saveBtn");
const deletePurchasesBtn = document.getElementById("deletePurchasesBtn");

saveBtn.onclick = async () => {
  const productValue = product.value.trim();
  const qtyValue = parseInt(qty.value, 10);
  const rateValue = parseFloat(rate.value);
  if (!productValue || isNaN(qtyValue) || isNaN(rateValue)) {
    alert("Please fill out all fields correctly.");
    return;
  }
  try {
    await addDoc(collection(db, "purchases"), { product: productValue, qty: qtyValue, rate: rateValue, date: new Date().toISOString() });
    product.value = "";
    qty.value = "";
    rate.value = "";
    await loadData();
  } catch (e) {
    alert("Failed to save.");
    console.error(e);
  }
};

async function deleteAllPurchases() {
  if (!confirm("Delete ALL purchases?")) return;
  const q = query(collection(db, "purchases"));
  const snapshot = await getDocs(q);
  const deletions = snapshot.docs.map(d => deleteDoc(doc(db, "purchases", d.id)));
  await Promise.all(deletions);
  alert("All purchases deleted.");
  await loadData();
}

deletePurchasesBtn.addEventListener("click", deleteAllPurchases);

export async function loadPurchases() {
  purchasesData = [];
  const purchaseCardList = document.getElementById("purchaseCardList");
  if (!purchaseCardList) return;
  purchaseCardList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "purchases"));
  snapshot.forEach(d => purchasesData.push({ id: d.id, ...d.data() }));
  purchasesData.sort((a, b) => new Date(b.date) - new Date(a.date));
  renderPurchaseCards(purchasesData);
  populateSaleItems();
  loadStockStatus();
}

function renderPurchaseCards(data) {
  const list = document.getElementById("purchaseCardList");
  list.innerHTML = "";
  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "purchase-card";
    card.setAttribute("data-name", p.product.toLowerCase());
    card.innerHTML = `
      <div class="card-header"><span>${p.product}</span><span>${new Date(p.date).toLocaleString()}</span></div>
      <div class="card-body"><p>Quantity: ${p.qty}</p><p>Rate: ₹${p.rate}</p></div>
      <button class="delete-btn" data-id="${p.id}">Delete</button>`;
    list.appendChild(card);
  });
  list.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", e => deletePurchase(e.target.dataset.id)));
}

async function deletePurchase(id) {
  if (!confirm("Delete this purchase?")) return;
  await deleteDoc(doc(db, "purchases", id));
  await loadData();
}
