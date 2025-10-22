import { db } from "./firebase.js";
import { addDoc, collection, getDocs } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const product = document.querySelector("#product");
const qty = document.querySelector("#qty");
const rate = document.querySelector("#rate");
const saveBtn = document.querySelector("#saveBtn");
const purchaseList = document.querySelector("#purchaseList");

// Save purchase to Firebase
saveBtn.onclick = async () => {
  await addDoc(collection(db, "purchases"), {
    product: product.value,
    qty: +qty.value,
    rate: +rate.value,
    date: new Date().toISOString()
  });
  alert("Saved in Firebase!");
  loadData(); // refresh list
};

// Load purchases from Firebase
async function loadData() {
  purchaseList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "purchases"));
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = `${data.product} – ${data.qty} pcs @ ₹${data.rate}`;
    purchaseList.appendChild(li);
  });
}

loadData();
