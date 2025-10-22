import { db } from "./firebase.js";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Purchase DOM elements
const product = document.querySelector("#product");
const qty = document.querySelector("#qty");
const rate = document.querySelector("#rate");
const saveBtn = document.querySelector("#saveBtn");
const purchaseList = document.getElementById("purchaseList");

// Sales DOM elements
const saleForm = document.getElementById('saleForm');
const saleItem = document.getElementById('saleItem');
const saleQuantity = document.getElementById('saleQuantity');
const salePrice = document.getElementById('salePrice');
const salesList = document.getElementById('salesList');

// Stock DOM elements
const stockList = document.getElementById('stockList');

let purchasesData = [];
let salesData = [];

// Save purchase to Firebase
saveBtn.onclick = async () => {
  const productValue = product.value.trim();
  const qtyValue = parseInt(qty.value, 10);
  const rateValue = parseFloat(rate.value);

  if (!productValue || isNaN(qtyValue) || isNaN(rateValue)) {
    alert("Please fill out all fields correctly.");
    return;
  }

  try {
    await addDoc(collection(db, "purchases"), {
      product: productValue,
      qty: qtyValue,
      rate: rateValue,
      date: new Date().toISOString()
    });
    console.log("Saved in Firebase!");
    product.value = "";
    qty.value = "";
    rate.value = "";
    await loadData();
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    alert("Failed to save. Check the console for errors.");
  }
};

async function deleteAllPurchases() {
  if (!confirm("Are you sure you want to delete ALL purchases? This action cannot be undone.")) return;

  try {
    const q = query(collection(db, "purchases"));
    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "purchases", d.id)));
    await Promise.all(deletePromises);

    alert("All purchases deleted.");
    await loadData();
  } catch (error) {
    console.error("Error deleting all purchases:", error);
    alert("Failed to delete purchases. Check console.");
  }
}

// Delete all sales
async function deleteAllSales() {
  if (!confirm("Are you sure you want to delete ALL sales? This action cannot be undone.")) return;

  try {
    const q = query(collection(db, "sales"));
    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "sales", d.id)));
    await Promise.all(deletePromises);

    alert("All sales deleted.");
    await loadData();
  } catch (error) {
    console.error("Error deleting all sales:", error);
    alert("Failed to delete sales. Check console.");
  }
}

const deletePurchasesBtn = document.getElementById('deletePurchasesBtn');
const deleteSalesBtn = document.getElementById('deleteSalesBtn');

deletePurchasesBtn.addEventListener('click', deleteAllPurchases);
deleteSalesBtn.addEventListener('click', deleteAllSales);

// Load purchases and display them sorted by newest date first
async function loadPurchases() {
  purchasesData = [];
  purchaseList.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "purchases"));

    snapshot.forEach(docSnap => {
      purchasesData.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Sort by date (latest first)
    purchasesData.sort((a, b) => new Date(b.date) - new Date(a.date));

    purchasesData.forEach(data => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${data.product}</td>
        <td>${data.qty}</td>
        <td>₹${data.rate}</td>
        <td>${new Date(data.date).toLocaleString()}</td>
        <td><button class="delete-btn" onclick="deletePurchase('${data.id}')">Delete</button></td>
      `;

      purchaseList.appendChild(tr);
    });

    populateSaleItems();
    loadStockStatus();
  } catch (error) {
    console.error("Error loading purchases:", error);
  }
}

// Delete a purchase
window.deletePurchase = async (id) => {
  if (confirm("Are you sure you want to delete this purchase?")) {
    try {
      await deleteDoc(doc(db, "purchases", id));
      await loadData();
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  }
};

// Load sales and display sorted by newest date first
async function loadSales() {
  salesData = [];
  salesList.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "sales"));

    snapshot.forEach(docSnap => {
      salesData.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Sort by date (latest first)
    salesData.sort((a, b) => new Date(b.date) - new Date(a.date));

    salesData.forEach(data => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${data.product}</td>
        <td>${data.qty}</td>
        <td>₹${data.salePrice}</td>
        <td>${new Date(data.date).toLocaleString()}</td>
        <td><button class="delete-btn" onclick="deleteSale('${data.id}')">Delete</button></td>
      `;

      salesList.appendChild(tr);
    });

    loadStockStatus();
  } catch (error) {
    console.error("Error loading sales:", error);
  }
}

// Delete a sale
window.deleteSale = async (id) => {
  if (confirm("Are you sure you want to delete this sale?")) {
    try {
      await deleteDoc(doc(db, "sales", id));
      await loadData();
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  }
};

// Populate sale item dropdown with unique purchased products and available stock
function populateSaleItems() {
  saleItem.innerHTML = "";
  const uniqueProducts = [...new Set(purchasesData.map(p => p.product))];

  uniqueProducts.forEach(productName => {
    const option = document.createElement("option");
    option.value = productName;
    const availableQty = getAvailableStock(productName);
    option.textContent = `${productName} (Available: ${availableQty})`;
    saleItem.appendChild(option);
  });
}

// Calculate available stock for a product
function getAvailableStock(productName) {
  const purchasedQty = purchasesData
    .filter(p => p.product === productName)
    .reduce((acc, p) => acc + p.qty, 0);

  const soldQty = salesData
    .filter(s => s.product === productName)
    .reduce((acc, s) => acc + s.qty, 0);

  return purchasedQty - soldQty;
}

// Handle sales form submission
saleForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const productName = saleItem.value;
  const qtyValue = parseInt(saleQuantity.value, 10);
  const salePriceValue = parseFloat(salePrice.value);

  if (!productName || isNaN(qtyValue) || qtyValue < 1 || isNaN(salePriceValue) || salePriceValue < 0) {
    alert("Please fill all fields correctly.");
    return;
  }

  const availableStock = getAvailableStock(productName);
  if (qtyValue > availableStock) {
    alert(`Insufficient stock. Only ${availableStock} units available.`);
    return;
  }

  try {
    await addDoc(collection(db, "sales"), {
      product: productName,
      qty: qtyValue,
      salePrice: salePriceValue,
      date: new Date().toISOString()
    });
    console.log("Sale added successfully!");
    saleForm.reset();
    await loadData();
  } catch (error) {
    console.error("Error adding sale:", error);
    alert("Failed to save sale.");
  }
});

// Load stock status table showing purchased, sold and pending qty
function loadStockStatus() {
  stockList.innerHTML = "";

  const allProducts = [...new Set([...purchasesData.map(p => p.product), ...salesData.map(s => s.product)])];

  allProducts.forEach(productName => {
    const purchasedQty = purchasesData
      .filter(p => p.product === productName)
      .reduce((acc, p) => acc + p.qty, 0);

    const soldQty = salesData
      .filter(s => s.product === productName)
      .reduce((acc, s) => acc + s.qty, 0);

    const pendingQty = purchasedQty - soldQty;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${productName}</td>
      <td>${purchasedQty}</td>
      <td>${soldQty}</td>
      <td>${pendingQty}</td>
    `;
    stockList.appendChild(tr);
  });
}

// Load both purchases and sales on page load or refresh
async function loadData() {
  await loadPurchases();
  await loadSales();
}

// Initial load
loadData();
