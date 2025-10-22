import { db } from "./firebase.js";
import { addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// Load purchases from Firebase
async function loadData() {
  purchaseList.innerHTML = "";
  try {
    const snapshot = await getDocs(collection(db, "purchases"));
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = `${data.product} – ${data.qty} pcs @ ₹${data.rate}`;
      purchaseList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading purchases:", error);
  }
}

// Initial load
loadData();
