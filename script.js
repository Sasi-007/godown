import { db } from "./firebase.js";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Get DOM elements
const product = document.querySelector("#product");
const qty = document.querySelector("#qty");
const rate = document.querySelector("#rate");
const saveBtn = document.querySelector("#saveBtn");
const purchaseList = document.getElementById("purchaseList");

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
    loadData();
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    alert("Failed to save. Check the console for errors.");
  }
};

// Load purchases and display them sorted by newest date first
async function loadData() {
  purchaseList.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "purchases"));
    const purchases = [];

    snapshot.forEach(docSnap => {
      purchases.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Sort by date (latest first)
    purchases.sort((a, b) => new Date(b.date) - new Date(a.date));

    purchases.forEach(data => {
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
  } catch (error) {
    console.error("Error loading purchases:", error);
  }
}

// Delete a purchase
window.deletePurchase = async (id) => {
  if (confirm("Are you sure you want to delete this purchase?")) {
    try {
      await deleteDoc(doc(db, "purchases", id));
      loadData();
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  }
};

// Initial load
loadData();
