import { purchasesData } from "./purchases.js";
import { salesData } from "./sales.js";

const stockList = document.getElementById("stockList");
const saleItem = document.getElementById("saleItem");

export function getAvailableStock(name) {
  const purchased = purchasesData.filter(p => p.product === name).reduce((a, p) => a + p.qty, 0);
  const sold = salesData.filter(s => s.product === name).reduce((a, s) => a + s.qty, 0);
  return purchased - sold;
}

export function populateSaleItems() {
  saleItem.innerHTML = "";
  const unique = [...new Set(purchasesData.map(p => p.product))];
  unique.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `${name} (Available: ${getAvailableStock(name)})`;
    saleItem.appendChild(opt);
  });
}

export function loadStockStatus() {
  stockList.innerHTML = "";
  const all = [...new Set([...purchasesData.map(p => p.product), ...salesData.map(s => s.product)])];
  all.forEach(name => {
    const purchased = purchasesData.filter(p => p.product === name).reduce((a, p) => a + p.qty, 0);
    const sold = salesData.filter(s => s.product === name).reduce((a, s) => a + s.qty, 0);
    const pending = purchased - sold;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${name}</td><td>${purchased}</td><td>${sold}</td><td>${pending}</td>`;
    stockList.appendChild(tr);
  });
}
