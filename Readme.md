# Sprint 02: Cash-Flow Financial Dashboard

## 📌 Project Overview
The "Cash-Flow" dashboard is a core engineering module designed to track personal finances, manage expenses, and visualize remaining balances in real-time. This project was developed strictly following the Sprint 02 constraints: utilizing **100% Vanilla JavaScript, HTML5, and CSS3** without the reliance on any modern frontend frameworks (like React or Vue) to demonstrate mastery over DOM manipulation, event handling, and client-side data management.

## 🚀 Features Implemented

### Phase 1: Base MVP (Core Engine)
* **Real-time State Management:** Captures Total Salary and Expenses via HTML5 validated forms.
* **Dynamic DOM Manipulation:** Instantly renders updated balances and injects new expense records into the transaction log without page reloads.
* **Strict Data Validation:** Prevents submission of negative values, empty strings, or expenses that exceed the available balance, providing clean UI error messaging instead of native browser alerts.

### Phase 2: Data Persistence & Visualization
* **LocalStorage Integration:** Serializes and saves state objects (salary and expense arrays) to the browser's local storage. Data persists seamlessly across browser reloads.
* **Delete Operations:** Users can remove individual expenses via a trash action, triggering an immediate state recalculation and DOM update.
* **Dynamic Visualization (Chart.js):** Integrated Chart.js via CDN to render a responsive Doughnut chart comparing "Remaining Balance" vs. "Total Expenses," which updates automatically upon state changes.

### Phase 3: Advanced Logic (Stretch Goals)
* **Threshold Alerts:** Implemented a critical UI warning banner that triggers dynamically if the user's remaining balance drops below 10% of their total salary.
* **PDF Report Generation:** Integrated `jsPDF` to allow users to export their financial logs and current balance as a formatted PDF document.
* **Live Currency Toggle (API Integration):** Integrated the free *Frankfurter API* to fetch live INR to USD exchange rates. Includes a fallback rate logic in case of network failure.

## 🛠️ Tech Stack & Architecture
* **Frontend:** HTML5, CSS3 (Custom Glassmorphism UI with CSS Variables), Vanilla JavaScript (ES6+)
* **External Libraries (via CDN):** 
  * [Chart.js (v4.x)](https://www.chartjs.org/) for data visualization.
  * [jsPDF (v2.5.1)](https://parall.ax/products/jspdf) for report generation.
  * [FontAwesome (v6.x)](https://fontawesome.com/) for UI icons.
* **Third-Party API:** [Frankfurter API](https://www.frankfurter.app/) for live currency conversion rates.

## ⚙️ Setup & Installation
Since this project uses Vanilla JS and CDNs, no Node.js environment or package manager is required. 

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Open `index.html` directly in any modern web browser, or use a local development server (like VS Code Live Server) for optimal performance.

## 🧠 Engineering Notes for Reviewers
* **Modular Code Structure:** The `script.js` file is heavily commented and divided into logical blocks (State Management, DOM References, Initialization, API Integration, Core Logic, Event Listeners).
* **Security & Edge Cases:** Inputs are sanitized and parsed properly using `parseFloat`. Fallback exchange rates are hardcoded to ensure the application does not break during API outages.
* **No Console Errors:** The application is built to execute cleanly under all edge-case scenarios without throwing unhandled exceptions in the console.
