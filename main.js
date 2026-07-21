document.addEventListener('DOMContentLoaded', () => {

    // 1. Theme Management
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('studysphere-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('studysphere-theme', newTheme);
        });
    }

    // 2. Home Page Date
    const liveDateEl = document.getElementById('live-date');
    if (liveDateEl) {
        liveDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // 3. POMODORO TIMER LOGIC (PLANNER)
    const minsDisplay = document.getElementById('minutes');
    const startBtn = document.getElementById('timer-start');
    if (minsDisplay && startBtn) {
        const secsDisplay = document.getElementById('seconds');
        const resetBtn = document.getElementById('timer-reset');
        const timeInput = document.getElementById('custom-time-input');
        const progressRing = document.getElementById('timer-progress-ring');
        
        let timerInterval;
        let totalTime = (timeInput && timeInput.value ? parseInt(timeInput.value) : 25) * 60; 
        let timeRemaining = totalTime; 
        let isRunning = false;
        const circleCircumference = 565.5; 

        function updateTimerUI() {
            let m = Math.floor(timeRemaining / 60);
            let s = timeRemaining % 60;
            minsDisplay.textContent = m.toString().padStart(2, '0');
            secsDisplay.textContent = s.toString().padStart(2, '0');
            
            if (progressRing) {
                let progressPercent = totalTime > 0 ? (timeRemaining / totalTime) : 0;
                let dashOffset = circleCircumference - (progressPercent * circleCircumference);
                progressRing.style.strokeDashoffset = dashOffset;
            }
        }

        if (timeInput) {
            timeInput.addEventListener('input', () => {
                if(!isRunning) {
                    let val = parseInt(timeInput.value);
                    if(isNaN(val) || val < 1) return; 
                    totalTime = val * 60;
                    timeRemaining = totalTime;
                    updateTimerUI();
                }
            });
        }

        startBtn.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                startBtn.textContent = 'Pause Focus';
                startBtn.style.backgroundColor = '#5F6368';
                if(timeInput) timeInput.disabled = true;
                
                timerInterval = setInterval(() => {
                    if (timeRemaining > 0) {
                        timeRemaining--;
                        updateTimerUI();
                    } else {
                        clearInterval(timerInterval);
                        alert('Focus session complete! Take a break.');
                        resetTimer();
                    }
                }, 1000);
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                startBtn.textContent = 'Resume Focus';
                startBtn.style.backgroundColor = 'var(--color-primary)';
            }
        });

        function resetTimer() {
            clearInterval(timerInterval);
            isRunning = false;
            let val = timeInput && timeInput.value ? parseInt(timeInput.value) : 25;
            if(isNaN(val) || val < 1) val = 25;
            totalTime = val * 60;
            timeRemaining = totalTime;
            updateTimerUI();
            startBtn.textContent = 'Start Focus';
            startBtn.style.backgroundColor = 'var(--color-primary)';
            if(timeInput) timeInput.disabled = false;
            if(progressRing) progressRing.style.strokeDashoffset = 0;
        }

        resetBtn.addEventListener('click', resetTimer);
        updateTimerUI(); 
    }

    // 4. PLANNER TASK MANAGER LOGIC
    const tableBody = document.getElementById('task-list-body');
    if (tableBody) {
        let tasks = JSON.parse(localStorage.getItem('advanced-tasks')) || [];
        const toggleFormBtn = document.getElementById('toggle-task-form-btn');
        const taskForm = document.getElementById('task-form');

        if (toggleFormBtn && taskForm) {
            toggleFormBtn.addEventListener('click', () => taskForm.classList.toggle('active'));
            document.getElementById('cancel-task-form-btn').addEventListener('click', () => {
                taskForm.classList.remove('active');
                taskForm.reset();
            });
        }

        function sortTasks() {
            tasks.sort((a, b) => {
                let o = { 'To Do': 1, 'In Progress': 2, 'Completed': 3 };
                if (o[a.status] !== o[b.status]) return o[a.status] - o[b.status];
                return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
            });
        }

        function renderPlannerTable(isInitial = false) {
            tableBody.innerHTML = '';
            tasks.forEach((task, index) => {
                const tr = document.createElement('tr');
                tr.className = 'row-transition';
                if (!isInitial) tr.classList.add('row-fading-in'); 
                const isDone = task.status === 'Completed';
                if (isDone) tr.classList.add('completed-row');

                let dateFormatted = new Date(task.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

                tr.innerHTML = `
                    <td><input type="checkbox" ${isDone ? 'checked' : ''} onclick="animateRowChange(${index}, 'checkbox')" style="cursor:pointer; width:18px; height:18px;"></td>
                    <td style="font-weight: 500;">${task.name}</td>
                    <td>${dateFormatted} <br> <small style="color: var(--text-muted);">${task.time}</small></td>
                    <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
                    <td><button class="btn-status-toggle ${task.status === 'In Progress' ? 'in-progress' : ''}" ${isDone ? 'disabled' : ''} onclick="animateRowChange(${index}, 'status')">${task.status === 'In Progress' ? 'Working' : 'To Do'}</button></td>
                    <td style="color: var(--text-muted);">${task.desc || '-'}</td>
                    <td style="text-align: right;"><button class="delete-btn-with-icon" onclick="instantDeleteTask(${index})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Delete</button></td>
                `;
                tableBody.appendChild(tr);
            });
        }

        window.animateRowChange = function(index, type) {
            let row = tableBody.children[index];
            row.classList.add('row-fading-out'); 
            setTimeout(() => {
                if (type === 'checkbox') tasks[index].status = tasks[index].status === 'Completed' ? 'To Do' : 'Completed';
                else if (type === 'status') tasks[index].status = tasks[index].status === 'In Progress' ? 'To Do' : 'In Progress';
                
                sortTasks();
                localStorage.setItem('advanced-tasks', JSON.stringify(tasks));
                renderPlannerTable(false); 
                updatePlannerCharts();
            }, 300); 
        }

        window.instantDeleteTask = function(index) {
            let row = tableBody.children[index];
            row.classList.add('row-fading-out'); 
            setTimeout(() => {
                tasks.splice(index, 1);
                sortTasks();
                localStorage.setItem('advanced-tasks', JSON.stringify(tasks));
                renderPlannerTable(false);
                updatePlannerCharts();
            }, 300);
        }

        if(taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                tasks.push({
                    name: document.getElementById('task-name').value,
                    date: document.getElementById('task-date').value,
                    time: document.getElementById('task-time').value,
                    priority: document.getElementById('task-priority').value,
                    desc: document.getElementById('task-desc').value,
                    status: 'To Do'
                });
                sortTasks();
                localStorage.setItem('advanced-tasks', JSON.stringify(tasks));
                taskForm.reset();
                taskForm.classList.remove('active');
                renderPlannerTable(false); 
                updatePlannerCharts();
            });
        }

        sortTasks();
        renderPlannerTable(true);
    }

    // 5. GLOBAL DASHBOARD CHART UPDATERS (Home & Planner)
    function updatePlannerCharts() {
        let tasks = JSON.parse(localStorage.getItem('advanced-tasks')) || [];
        let todo = 0, working = 0, done = 0;
        tasks.forEach(t => {
            if (t.status === 'Completed') done++;
            else if (t.status === 'In Progress') working++;
            else todo++;
        });

        let total = tasks.length;
        const pRate = document.getElementById('planner-completion-rate');
        const pChart = document.getElementById('planner-chart-bg');
        if(pRate) pRate.textContent = total > 0 ? Math.round((done / total) * 100) + '%' : '0%';
        if(document.getElementById('planner-todo-count')) document.getElementById('planner-todo-count').textContent = todo;
        if(document.getElementById('planner-progress-count')) document.getElementById('planner-progress-count').textContent = working;
        if(document.getElementById('planner-done-count')) document.getElementById('planner-done-count').textContent = done;

        const hRate = document.getElementById('completion-rate');
        const hChart = document.getElementById('home-chart-bg');
        if(hRate) hRate.textContent = total > 0 ? Math.round((done / total) * 100) + '%' : '0%';
        if(document.getElementById('todo-count')) document.getElementById('todo-count').textContent = todo;
        if(document.getElementById('progress-count')) document.getElementById('progress-count').textContent = working;
        if(document.getElementById('done-count')) document.getElementById('done-count').textContent = done;

        if (total > 0 && (pChart || hChart)) {
            let donePct = (done / total) * 100;
            let workingPct = donePct + ((working / total) * 100);
            let gradientString = `conic-gradient(var(--color-success) 0% ${donePct}%, var(--color-primary) ${donePct}% ${workingPct}%, var(--border-subtle) ${workingPct}% 100%)`;
            if(pChart) pChart.style.background = gradientString;
            if(hChart) hChart.style.background = gradientString;
        } else if (pChart || hChart) {
            let defaultGrad = `conic-gradient(var(--border-subtle) 0% 100%)`;
            if(pChart) pChart.style.background = defaultGrad;
            if(hChart) hChart.style.background = defaultGrad;
        }
    }
    updatePlannerCharts();


    // ==========================================
    // 6. BUDGET & EXPENSE PLANNER LOGIC (Fixed Sorting: Nearest First)
    // ==========================================
    const budgetListBody = document.getElementById('budget-list-body');
    const toggleBudgetBtn = document.getElementById('toggle-budget-form-btn');
    const budgetForm = document.getElementById('budget-form');
    
    let transactions = JSON.parse(localStorage.getItem('budget-transactions')) || [];
    const getToday = () => { let d = new Date(); d.setHours(0,0,0,0); return d; }

    if (budgetListBody) {
        
        if (toggleBudgetBtn && budgetForm) {
            toggleBudgetBtn.addEventListener('click', () => budgetForm.classList.toggle('active'));
            document.getElementById('cancel-budget-form-btn').addEventListener('click', () => {
                budgetForm.classList.remove('active');
                budgetForm.reset();
            });
        }

        function sortTransactions() {
            // FIXED: Nearest/Earliest Date First (Ascending order: e.g. 19 before 20)
            transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        function renderBudgetTable(isInitial = false) {
            budgetListBody.innerHTML = '';
            let today = getToday();
            let overdueOrTodayCount = 0;

            transactions.forEach((t, index) => {
                const tr = document.createElement('tr');
                tr.className = 'row-transition';
                if (!isInitial) tr.classList.add('row-fading-in'); 
                
                let transDate = new Date(t.date);
                transDate.setHours(0,0,0,0);
                
                let isFuture = transDate > today && !t.paid;
                let isDueTodayOrOverdue = transDate <= today && !t.paid && t.dateScheduled;

                if (isFuture) tr.classList.add('upcoming-row');
                if (isDueTodayOrOverdue) overdueOrTodayCount++;

                let dateFormatted = transDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                let badgeClass = t.type === 'Income' ? 'badge-income' : 'badge-expense';
                
                let actionBtns = '';
                if (isFuture || isDueTodayOrOverdue) {
                    actionBtns += `<button class="btn-pay-now" onclick="markAsPaid(${index})">Mark Paid</button>`;
                }
                actionBtns += `<button class="delete-btn-with-icon" onclick="instantDeleteTransaction(${index})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>`;

                tr.innerHTML = `
                    <td><span class="trans-badge ${badgeClass}">${t.type}</span></td>
                    <td style="font-weight: 500;">${t.title} ${isFuture ? '<span style="font-size:0.7rem; color:var(--text-muted);">(Upcoming)</span>' : ''}</td>
                    <td>${t.category}</td>
                    <td>${dateFormatted}</td>
                    <td style="text-align: right; font-weight: 600;">${parseFloat(t.amount).toLocaleString()}</td>
                    <td style="text-align: right;">${actionBtns}</td>
                `;
                budgetListBody.appendChild(tr);
            });

            const bellBadge = document.getElementById('notification-badge');
            if (bellBadge) {
                bellBadge.textContent = overdueOrTodayCount;
                if (overdueOrTodayCount > 0) bellBadge.classList.add('active');
                else bellBadge.classList.remove('active');
            }
        }

        window.markAsPaid = function(index) {
            let row = budgetListBody.children[index];
            row.classList.add('row-fading-out'); 
            setTimeout(() => {
                transactions[index].paid = true;
                let d = new Date();
                transactions[index].date = d.toISOString().split('T')[0]; 
                transactions[index].dateScheduled = false; 
                
                sortTransactions();
                localStorage.setItem('budget-transactions', JSON.stringify(transactions));
                renderBudgetTable(false);
                updateBudgetCharts();
            }, 300);
        }

        window.instantDeleteTransaction = function(index) {
            let row = budgetListBody.children[index];
            row.classList.add('row-fading-out'); 
            setTimeout(() => {
                transactions.splice(index, 1);
                sortTransactions();
                localStorage.setItem('budget-transactions', JSON.stringify(transactions));
                renderBudgetTable(false);
                updateBudgetCharts();
            }, 300);
        }

        if(budgetForm) {
            budgetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                let selectedDateStr = document.getElementById('trans-date').value;
                let transDate = new Date(selectedDateStr);
                transDate.setHours(0,0,0,0);
                let today = getToday();
                
                transactions.push({
                    type: document.getElementById('trans-type').value,
                    category: document.getElementById('trans-category').value,
                    title: document.getElementById('trans-title').value,
                    amount: document.getElementById('trans-amount').value,
                    date: selectedDateStr,
                    paid: transDate <= today, 
                    dateScheduled: transDate > today
                });
                
                sortTransactions();
                localStorage.setItem('budget-transactions', JSON.stringify(transactions));
                budgetForm.reset();
                budgetForm.classList.remove('active');
                renderBudgetTable(false);
                updateBudgetCharts();
            });
        }

        sortTransactions();
        renderBudgetTable(true);
    }

    function updateBudgetCharts() {
        let totalIncome = 0;
        let totalExpense = 0;
        let catTotals = { 'Food': 0, 'Travel': 0, 'Education': 0, 'Accommodation': 0, 'Other': 0 };
        let today = getToday();

        transactions.forEach(t => {
            let transDate = new Date(t.date);
            transDate.setHours(0,0,0,0);
            if(transDate <= today || t.paid) {
                let amt = parseFloat(t.amount);
                if (t.type === 'Income') totalIncome += amt;
                if (t.type === 'Expense') {
                    totalExpense += amt;
                    if(catTotals[t.category] !== undefined) catTotals[t.category] += amt;
                    else catTotals['Other'] += amt; 
                }
            }
        });

        const netBalance = totalIncome - totalExpense;

        const updateText = (id, val, isNet = false) => {
            let el = document.getElementById(id);
            if(el) {
                el.textContent = `LKR ${val.toLocaleString('en-US', {minimumFractionDigits: isNet ? 2 : 0})}`;
            }
        };

        updateText('net-balance-display', netBalance, true);
        updateText('home-net-balance', netBalance, true);
        updateText('income-display', totalIncome);
        updateText('home-income-val', totalIncome);
        updateText('expense-display', totalExpense);
        updateText('home-expense-val', totalExpense);

        const updateTugBar = (incId, expId) => {
            let incBar = document.getElementById(incId);
            let expBar = document.getElementById(expId);
            if(incBar && expBar) {
                let totalAmount = totalIncome + totalExpense;
                if(totalAmount > 0) {
                    incBar.style.width = `${(totalIncome / totalAmount) * 100}%`;
                    expBar.style.width = `${(totalExpense / totalAmount) * 100}%`;
                } else {
                    incBar.style.width = '50%';
                    expBar.style.width = '50%';
                }
            }
        }
        updateTugBar('budget-bar-income', 'budget-bar-expense');
        updateTugBar('bar-income', 'bar-expense'); 

        const donutChart = document.getElementById('donut-chart-bg');
        const catList = document.getElementById('category-list');
        const donutTotal = document.getElementById('donut-total');
        
        if (donutChart && catList) {
            if (donutTotal) donutTotal.textContent = `LKR ${totalExpense.toLocaleString()}`;
            catList.innerHTML = '';
            
            if (totalExpense > 0) {
                let colors = { 'Food': 'var(--cat-food)', 'Travel': 'var(--cat-travel)', 'Education': 'var(--cat-edu)', 'Accommodation': 'var(--cat-acc)', 'Other': 'var(--cat-other)' };
                let gradientStops = [];
                let currentPct = 0;

                for (const [cat, amt] of Object.entries(catTotals)) {
                    if (amt > 0) {
                        let pct = (amt / totalExpense) * 100;
                        gradientStops.push(`${colors[cat]} ${currentPct}% ${currentPct + pct}%`);
                        currentPct += pct;

                        // Wider layout row for categories
                        catList.innerHTML += `
                            <div class="category-item-row">
                                <span style="display:flex; align-items:center;">
                                    <span class="dot" style="background-color: ${colors[cat]};"></span> ${cat}
                                </span>
                                <strong>LKR ${amt.toLocaleString()}</strong>
                            </div>`;
                    }
                }
                donutChart.style.background = `conic-gradient(${gradientStops.join(', ')})`;
            } else {
                donutChart.style.background = `conic-gradient(var(--border-subtle) 0% 100%)`;
                catList.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">No expenses yet.</div>';
            }
        }
    }
    updateBudgetCharts();
});

