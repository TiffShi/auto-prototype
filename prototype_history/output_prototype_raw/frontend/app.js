/* ============================================================
   Banking App — Frontend Logic
   All API calls target the URL defined in the .env file.
   Since this is a plain HTML/JS app (no bundler), we read
   the env variable via a config object injected at the top.
============================================================ */

// ---------------------------------------------------------------------------
// Configuration — reads from window.__ENV__ (set by env.js) or falls back
// to the .env-defined value. For a plain static server we expose it here.
// ---------------------------------------------------------------------------
const CONFIG = {
  API_URL: "http://localhost:8080", // Matches API_URL in .env
};

// ---------------------------------------------------------------------------
// DOM References
// ---------------------------------------------------------------------------
const balanceValue = document.getElementById("balance-value");
const balanceShimmer = document.getElementById("balance-shimmer");
const amountInput = document.getElementById("amount-input");
const depositBtn = document.getElementById("deposit-btn");
const withdrawBtn = document.getElementById("withdraw-btn");
const inputError = document.getElementById("input-error");
const inputWrapper = amountInput.closest(".input-wrapper");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const historyCount = document.getElementById("history-count");
const notification = document.getElementById("notification");
const notificationText = document.getElementById("notification-text");
const notificationIcon = document.getElementById("notification-icon");
const notificationClose = document.getElementById("notification-close");

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let notificationTimer = null;

// ---------------------------------------------------------------------------
// Utility: Format currency
// ---------------------------------------------------------------------------
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Utility: Format timestamp
// ---------------------------------------------------------------------------
function formatTimestamp(isoString) {
  try {
    const date = new Date(isoString + (isoString.endsWith("Z") ? "" : "Z"));
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

// ---------------------------------------------------------------------------
// Utility: Show notification banner
// ---------------------------------------------------------------------------
function showNotification(message, type = "success") {
  if (notificationTimer) {
    clearTimeout(notificationTimer);
  }

  notification.className = `notification visible ${type}`;
  notificationText.textContent = message;
  notificationIcon.textContent = type === "success" ? "✓" : "✕";

  notificationTimer = setTimeout(() => {
    hideNotification();
  }, 5000);
}

function hideNotification() {
  notification.className = "notification";
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
}

// ---------------------------------------------------------------------------
// Utility: Show/clear input validation error
// ---------------------------------------------------------------------------
function setInputError(message) {
  inputError.textContent = message;
  inputWrapper.classList.toggle("error-state", !!message);
}

function clearInputError() {
  inputError.textContent = "";
  inputWrapper.classList.remove("error-state");
}

// ---------------------------------------------------------------------------
// Utility: Set loading state on buttons
// ---------------------------------------------------------------------------
function setLoading(isLoading) {
  depositBtn.disabled = isLoading;
  withdrawBtn.disabled = isLoading;

  if (isLoading) {
    balanceShimmer.classList.add("active");
  } else {
    balanceShimmer.classList.remove("active");
  }
}

// ---------------------------------------------------------------------------
// Utility: Validate amount input
// Returns parsed float or null if invalid
// ---------------------------------------------------------------------------
function validateAmount() {
  const raw = amountInput.value.trim();

  if (raw === "" || raw === null) {
    setInputError("Please enter an amount.");
    return null;
  }

  const amount = parseFloat(raw);

  if (isNaN(amount)) {
    setInputError("Please enter a valid number.");
    return null;
  }

  if (amount <= 0) {
    setInputError("Amount must be greater than $0.00.");
    return null;
  }

  if (amount > 1_000_000) {
    setInputError("Amount cannot exceed $1,000,000.00.");
    return null;
  }

  // Check for more than 2 decimal places
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    setInputError("Amount can have at most 2 decimal places.");
    return null;
  }

  clearInputError();
  return amount;
}

// ---------------------------------------------------------------------------
// API: Refresh balance display
// ---------------------------------------------------------------------------
async function refreshBalance() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/balance`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    balanceValue.textContent = formatCurrency(data.balance);
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    balanceValue.textContent = "Error";
    showNotification("Could not load balance. Is the server running?", "error");
  }
}

// ---------------------------------------------------------------------------
// API: Refresh transaction history
// ---------------------------------------------------------------------------
async function refreshHistory() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/transactions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    renderHistory(data.transactions);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
  }
}

// ---------------------------------------------------------------------------
// Render: Build transaction history list
// ---------------------------------------------------------------------------
function renderHistory(transactions) {
  historyList.innerHTML = "";

  const count = transactions.length;
  historyCount.textContent = `${count} transaction${count !== 1 ? "s" : ""}`;

  if (count === 0) {
    historyEmpty.classList.remove("hidden");
    return;
  }

  historyEmpty.classList.add("hidden");

  // Render newest first
  const sorted = [...transactions].reverse();

  sorted.forEach((tx) => {
    const item = document.createElement("li");
    item.className = `transaction-item ${tx.type}`;

    const isDeposit = tx.type === "deposit";
    const iconSvg = isDeposit
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <line x1="12" y1="5" x2="12" y2="19"/>
           <polyline points="19 12 12 19 5 12"/>
         </svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <line x1="12" y1="19" x2="12" y2="5"/>
           <polyline points="5 12 12 5 19 12"/>
         </svg>`;

    const amountPrefix = isDeposit ? "+" : "−";

    item.innerHTML = `
      <div class="transaction-icon">${iconSvg}</div>
      <div class="transaction-details">
        <div class="transaction-type">${tx.type}</div>
        <div class="transaction-time">${formatTimestamp(tx.timestamp)}</div>
      </div>
      <div class="transaction-amount">${amountPrefix}$${formatCurrency(tx.amount)}</div>
    `;

    historyList.appendChild(item);
  });
}

// ---------------------------------------------------------------------------
// API: Deposit
// ---------------------------------------------------------------------------
async function deposit(amount) {
  setLoading(true);

  try {
    const response = await fetch(`${CONFIG.API_URL}/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.detail || "Deposit failed. Please try again.";
      showNotification(errorMsg, "error");
      return;
    }

    balanceValue.textContent = formatCurrency(data.balance);
    showNotification(data.message, "success");
    amountInput.value = "";
    clearInputError();
    await refreshHistory();
  } catch (error) {
    console.error("Deposit error:", error);
    showNotification("Network error. Could not complete deposit.", "error");
  } finally {
    setLoading(false);
  }
}

// ---------------------------------------------------------------------------
// API: Withdraw
// ---------------------------------------------------------------------------
async function withdraw(amount) {
  setLoading(true);

  try {
    const response = await fetch(`${CONFIG.API_URL}/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.detail || "Withdrawal failed. Please try again.";
      showNotification(errorMsg, "error");
      return;
    }

    balanceValue.textContent = formatCurrency(data.balance);
    showNotification(data.message, "success");
    amountInput.value = "";
    clearInputError();
    await refreshHistory();
  } catch (error) {
    console.error("Withdraw error:", error);
    showNotification("Network error. Could not complete withdrawal.", "error");
  } finally {
    setLoading(false);
  }
}

// ---------------------------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------------------------

// Deposit button
depositBtn.addEventListener("click", () => {
  const amount = validateAmount();
  if (amount !== null) {
    deposit(amount);
  }
});

// Withdraw button
withdrawBtn.addEventListener("click", () => {
  const amount = validateAmount();
  if (amount !== null) {
    withdraw(amount);
  }
});

// Allow Enter key to trigger deposit (primary action)
amountInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const amount = validateAmount();
    if (amount !== null) {
      deposit(amount);
    }
  }
});

// Clear error on input change
amountInput.addEventListener("input", () => {
  if (inputError.textContent) {
    clearInputError();
  }
});

// Dismiss notification
notificationClose.addEventListener("click", hideNotification);

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------
async function init() {
  balanceValue.textContent = "…";
  balanceShimmer.classList.add("active");

  await Promise.all([refreshBalance(), refreshHistory()]);

  balanceShimmer.classList.remove("active");
}

// Boot the app
init();