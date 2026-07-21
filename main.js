// StudySphere - Main Controller Architecture
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. SYSTEM THEME MANAGEMENT
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('studysphere-theme') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('studysphere-theme', newTheme);
        });
    }

    // ==========================================
    // 2. LIVE DATE & GREETING (HOME DASHBOARD)
    // ==========================================
    const liveDateEl = document.getElementById('live-date');
    if (liveDateEl) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        liveDateEl.textContent = now.toLocaleDateString('en-US', options);
    }

    // ==========================================
    // 3. DASHBOARD WIDGETS DATA SYNCHRONIZATION
    // ==========================================
    
    // Synchronize Task Progress Widget
    function syncTaskWidget() {
        const tasks = JSON.parse(localStorage.getItem('advanced-tasks')) || [];
        
        let todo = 0;
        let inProgress = 0;
        let completed = 0;

        tasks.forEach(task => {
            if (task.completed) {
                completed++;
            } else if (task.status === 'In Progress') {
                inProgress++;
            } else {
                todo++;
            }
        });

        const total = tasks.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const rateEl = document.getElementById('completion-rate');
        const todoEl = document.getElementById('todo-count');
        const progressEl = document.getElementById('progress-count');
        const doneEl = document.getElementById('done-count');

        if (rateEl) rateEl.textContent = `${rate}%`;
        if (todoEl) todoEl.textContent = todo;
        if (progressEl) progressEl.textContent = inProgress;
        if (doneEl) doneEl.textContent = completed;
    }

    // Synchronize Financial Budget Widget
    function syncBudgetWidget() {
        const transactions = JSON.parse(localStorage.getItem('budget-transactions')) || [];
        
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'Income') totalIncome += parseFloat(t.amount);
            if (t.type === 'Expense') totalExpense += parseFloat(t.amount);
        });

        const netBalance = totalIncome - totalExpense;

        const netEl = document.getElementById('home-net-balance');
        const incEl = document.getElementById('home-income-val');
        const expEl = document.getElementById('home-expense-val');

        if (netEl) netEl.textContent = `LKR ${netBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        if (incEl) incEl.textContent = `LKR ${totalIncome.toLocaleString()}`;
        if (expEl) expEl.textContent = `LKR ${totalExpense.toLocaleString()}`;

        // Update Split Bar Visualization
        const totalAmount = totalIncome + totalExpense;
        const incomeBar = document.getElementById('bar-income');
        const expenseBar = document.getElementById('bar-expense');

        if (incomeBar && expenseBar) {
            if (totalAmount > 0) {
                const incPercent = (totalIncome / totalAmount) * 100;
                const expPercent = (totalExpense / totalAmount) * 100;
                incomeBar.style.width = `${incPercent}%`;
                expenseBar.style.width = `${expPercent}%`;
            } else {
                incomeBar.style.width = '50%';
                expenseBar.style.width = '50%';
            }
        }
    }

    // Run Sync on Page Load
    syncTaskWidget();
    syncBudgetWidget();
});

