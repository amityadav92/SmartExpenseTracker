
// ==========================================
// SMART EXPENSE TRACKER - API CONFIGURATION
// ==========================================

// LIVE BACKEND URL
const API_URL = `${
  import.meta.env.VITE_API_URL ||
  "https://smartexpensetracker-836g.onrender.com"
}/api/transactions`;

// ==========================================
// GET ALL TRANSACTIONS
// ==========================================

export const getTransactions = async () => {
  const response = await fetch(API_URL);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch transactions");
  }

  return data;
};

// ==========================================
// ADD TRANSACTION
// ==========================================

export const addTransactionAPI = async (transaction) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add transaction");
  }

  return data;
};

// ==========================================
// UPDATE TRANSACTION
// ==========================================

export const updateTransactionAPI = async (id, transaction) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update transaction");
  }

  return data;
};

// ==========================================
// DELETE TRANSACTION
// ==========================================

export const deleteTransactionAPI = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete transaction");
  }

  return data;
};
