/**
 * PRODESK IT - SPRINT 02
 * Module: Cash-Flow Dashboard
 * Core Tech: Vanilla JS, Chart.js, jsPDF, Frankfurter API
 */

// --- 1. STATE MANAGEMENT ---
let state = {
    salary: 0, // Stored in base currency (INR)
    expenses: [], // Array of objects {id, name, amount}
    currentCurrency: 'INR',
    exchangeRate: 1 // 1 for INR. Will update dynamically for USD
};

let expenseChartInstance = null; // Chart reference for destruction

// --- 2. DOM ELEMENT REFERENCES ---
const form = document.getElementById('cash-flow-form');
const salaryInput = document.getElementById('salary');
const expNameInput = document.getElementById('expense-name');
const expAmountInput = document.getElementById('expense-amount');

const uiError = document.getElementById('ui-error');
const alertBanner = document.getElementById('alert-banner');

const displaySalary = document.getElementById('display-salary');
const displayExpenses = document.getElementById('display-expenses');
const displayBalance = document.getElementById('display-balance');
const expenseList = document.getElementById('expense-list');

const toggleCurrencyBtn = document.getElementById('toggle-currency');
const currencyLabel = document.getElementById('currency-label');
const downloadBtn = document.getElementById('download-report');

// --- 3. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    fetchExchangeRate(); // Pre-fetch USD rate
    renderDashboard();
});

// Load from LocalStorage
function loadData() {
    const savedSalary = localStorage.getItem('cashFlow_salary');
    const savedExpenses = localStorage.getItem('cashFlow_expenses');
    
    if (savedSalary) state.salary = parseFloat(savedSalary);
    if (savedExpenses) state.expenses = JSON.parse(savedExpenses);
}

// Save to LocalStorage
function saveData() {
    localStorage.setItem('cashFlow_salary', state.salary.toString());
    localStorage.setItem('cashFlow_expenses', JSON.stringify(state.expenses));
}

// --- 4. API INTEGRATION (CURRENCY) ---
async function fetchExchangeRate() {
    try {
        const response = await fetch('https://api.frankfurter.app/latest?from=INR&to=USD');
        const data = await response.json();
        state.exchangeRate = data.rates.USD;
    } catch (error) {
        console.warn('API Error: Using fallback exchange rate.');
        state.exchangeRate = 0.012; // Fallback rate
    }
}

// --- 5. CORE LOGIC & RENDERING ---
function renderDashboard() {
    const totalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBalance = state.salary - totalExpenses;

    // Currency Formatting (Math logic applies rate)
    const sym = state.currentCurrency === 'INR' ? '₹' : '$';
    const rate = state.currentCurrency === 'INR' ? 1 : state.exchangeRate;

    const calcSalary = (state.salary * rate).toFixed(2);
    const calcExpenses = (totalExpenses * rate).toFixed(2);
    const calcBalance = (remainingBalance * rate).toFixed(2);

    // Update DOM Text
    displaySalary.textContent = `${sym}${calcSalary}`;
    displayExpenses.textContent = `${sym}${calcExpenses}`;
    displayBalance.textContent = `${sym}${calcBalance}`;

    // Threshold Alert (Phase 3)
    if (state.salary > 0 && remainingBalance < (state.salary * 0.10)) {
        alertBanner.classList.remove('hidden');
        displayBalance.classList.add('text-red');
    } else {
        alertBanner.classList.add('hidden');
        displayBalance.classList.remove('text-red');
    }

    renderExpenseList(sym, rate);
    updateChart(remainingBalance, totalExpenses);
}

function renderExpenseList(sym, rate) {
    expenseList.innerHTML = '';
    
    state.expenses.forEach(exp => {
        const li = document.createElement('li');
        li.className = 'expense-item';
        
        const calcAmount = (exp.amount * rate).toFixed(2);
        
        li.innerHTML = `
            <div class="expense-info">
                <span class="expense-title">${exp.name}</span>
                <span class="expense-cost">${sym}${calcAmount}</span>
            </div>
            <button class="delete-btn" onclick="removeExpense(${exp.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        expenseList.appendChild(li);
    });
}

// --- 6. EVENT LISTENERS & VALIDATION ---
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const salaryVal = parseFloat(salaryInput.value);
    const expName = expNameInput.value.trim();
    const expAmount = parseFloat(expAmountInput.value);

    uiError.classList.add('hidden');

    // State Updates based on what is provided
    if (!isNaN(salaryVal) && salaryVal > 0) {
        state.salary = salaryVal;
    }

    if (expName || !isNaN(expAmount)) {
        // Validation for expense
        if (expName === '' || isNaN(expAmount) || expAmount <= 0) {
            uiError.textContent = "Please enter a valid expense name and positive amount.";
            uiError.classList.remove('hidden');
            return;
        }
        
        // Add new expense
        state.expenses.push({
            id: Date.now(),
            name: expName,
            amount: expAmount
        });
    }

    // Reset Expense fields only
    expNameInput.value = '';
    expAmountInput.value = '';

    saveData();
    renderDashboard();
});

// Delete Function (Exposed to global for onclick)
window.removeExpense = function(id) {
    state.expenses = state.expenses.filter(exp => exp.id !== id);
    saveData();
    renderDashboard();
};

// Currency Toggle
toggleCurrencyBtn.addEventListener('click', () => {
    if (state.currentCurrency === 'INR') {
        state.currentCurrency = 'USD';
        currencyLabel.textContent = 'Switch to INR';
    } else {
        state.currentCurrency = 'INR';
        currencyLabel.textContent = 'Switch to USD';
    }
    renderDashboard();
});

// --- 7. EXTERNAL LIBRARIES ---

// Chart.js Visualization
function updateChart(balance, expenses) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Destroy existing chart to prevent rendering overlaps
    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    // Handle negative balance in chart visually
    const safeBalance = balance > 0 ? balance : 0;

    expenseChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Remaining Balance', 'Total Expenses'],
            datasets: [{
                data: [safeBalance, expenses],
                backgroundColor: ['#10b981', '#ef4444'], // Emerald, Red
                borderColor: '#090d16',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#f8fafc' } }
            },
            cutout: '70%'
        }
    });
}

// jsPDF Report Generation
downloadBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const sym = state.currentCurrency === 'INR' ? 'INR ' : 'USD ';
    const rate = state.currentCurrency === 'INR' ? 1 : state.exchangeRate;
    
    const totalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const balance = state.salary - totalExpenses;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Cash-Flow Financial Report", 20, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    doc.line(20, 35, 190, 35); // Separator

    doc.setFont("helvetica", "bold");
    doc.text(`Total Salary: ${sym}${(state.salary * rate).toFixed(2)}`, 20, 45);
    doc.text(`Total Expenses: ${sym}${(totalExpenses * rate).toFixed(2)}`, 20, 55);
    doc.text(`Remaining Balance: ${sym}${(balance * rate).toFixed(2)}`, 20, 65);

    doc.line(20, 70, 190, 70);

    doc.text("Expense Breakdown:", 20, 85);
    doc.setFont("helvetica", "normal");
    
    let yPos = 95;
    if (state.expenses.length === 0) {
        doc.text("No expenses recorded.", 20, yPos);
    } else {
        state.expenses.forEach((exp, index) => {
            doc.text(`${index + 1}. ${exp.name}`, 20, yPos);
            doc.text(`${sym}${(exp.amount * rate).toFixed(2)}`, 160, yPos);
            yPos += 10;
        });
    }

    doc.save(`CashFlow_Report_${Date.now()}.pdf`);
});