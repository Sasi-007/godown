import { loadPurchases } from "./purchases.js";
import { loadSales } from "./sales.js";
import "./ui.js";

export async function loadData() {
  await loadPurchases();
  await loadSales();
}

loadData();
