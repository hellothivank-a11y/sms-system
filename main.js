// StudySphere System Controller
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
    // 2. LIVE DATE (HOME PAGE)
    // ==========================================
    const liveDateEl = document.getElementById('live-date');
    if (liveDateEl) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        liveDateEl.textContent = now.toLocaleDateString('en-US', options);
    }

    // ==========================================
    // 3. POMODORO TIMER (PLANNER PAGE)
    // ==========================================
    const minsDisplay = document.getElementById('minutes');
    const secsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('timer-start');
    const resetBtn = document.getElementById('timer-reset');

    if (minsDisplay && secsDisplay && startBtn && resetBtn) {
        let timerInterval;
        let timeRemaining = 25 * 60; // 25 Minutes
        let isRunning = false;

        function updateTimerUI() {
            let minutes = Math.floor(timeRemaining / 60);
            let seconds = timeRemaining % 60;
            minsDisplay.textContent = minutes.toString().padStart(2, '0');
            secsDisplay.textContent = seconds.toString().padStart(2, '0');
        }

        startBtn.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                startBtn.textContent = 'Pause';
                startBtn.style.backgroundColor = '#5F6368';
                
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
                startBtn.textContent = 'Start Focus';
                startBtn.style.backgroundColor = 'var(--color-primary)';
            }
        });

        function resetTimer() {
            clearInterval(timerInterval);
            isRunning = false;
            timeRemaining = 25 * 60;
            updateTimerUI();
            startBtn.textContent = 'Start Focus';
            startBtn.style.backgroundColor = 'var(--color-primary)';
        }

        resetBtn.addEventListener('click', resetTimer);
    }

    // ==========================================
    // 4. ADVANCED TASK MANAGER (PLANNER PAGE)
    // ==========================================
    const toggleFormBtn = document.getElementById('toggle-task-form-btn');
    const cancelFormBtn = document.getElementById('cancel-task-form-btn');
    const taskForm = document.getElementById('task-form');
    const tableBody = document.getElementById('task-list-body');

    if (taskForm && tableBody) {
        let tasks = JSON.parse(localStorage.getItem('advanced-tasks')) || [];

        // Toggle Expanding Form
        if (toggleFormBtn) {
            toggleFormBtn.addEventListener('click', () => {
                taskForm.classList.toggle('active');
            });
        }

        if (cancelFormBtn) {
            cancelFormBtn.addEventListener('click', () => {
                taskForm.classList.remove('active');
                taskForm.reset();
            });
        }

        // Save & Render with Sorting Logic
        function saveAndRender() {
            // Sorting Logic: 1. To Do (Pending), 2. In Progress, 3. Completed (Bottom)
            tasks.sort((a, b) => {
                let statusOrder = { 'To Do': 1, 'In Progress': 2, 'Completed': 3 };
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }
                // Secondary Sort by Date and Time
                return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
            });

            localStorage.setItem('advanced-tasks', JSON.stringify(tasks));
            renderPlannerTable();
            updatePlannerChart();
        }

        function renderPlannerTable() {
            tableBody.innerHTML = '';

            tasks.forEach((task, index) => {
                const tr = document.createElement('tr');
                const isDone = task.status === 'Completed';
                if (isDone) tr.className = 'completed-row';

                let formattedDate = new Date(task.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

                tr.innerHTML = `
                    <td>
                        <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleTaskComplete(${index})" style="cursor:pointer; width: 18px; height: 18px;">
                    </td>
                    <td style="font-weight: 500;">${task.name}</td>
                    <td>${formattedDate} <br> <small style="color: var(--text-muted);">${task.time}</small></td>
                    <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
                    <td>
                        <button class="btn-status-toggle ${task.status === 'In Progress' ? 'in-progress' : ''}" 
                                ${isDone ? 'disabled' : ''} 
                                onclick="toggleInProgressStatus(${index})">
                            ${task.status === 'In Progress' ? 'Working' : 'To Do'}
                        </button>
                    </td>
                    <td style="color: var(--text-muted);">${task.desc || '-'}</td>
                    <td style="text-align: right;">
                        <button class="delete-btn-with-icon" onclick="deleteTaskItem(${index})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }

        function updatePlannerChart() {
            let todo = 0, inProgress = 0, completed = 0;
            tasks.forEach(t => {
                if (t.status === 'Completed') completed++;
                else if (t.status === 'In Progress') inProgress++;
                else todo++;
            });

            const total = tasks.length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

            const rateEl = document.getElementById('planner-completion-rate');
            const todoEl = document.getElementById('planner-todo-count');
            const progressEl = document.getElementById('planner-progress-count');
            const doneEl = document.getElementById('planner-done-count');
            const chartBg = document.getElementById('planner-chart-bg');

            if (rateEl) rateEl.textContent = `${rate}%`;
            if (todoEl) todoEl.textContent = todo;
            if (progressEl) progressEl.textContent = inProgress;
            if (doneEl) doneEl.textContent = completed;

            if (chartBg) {
                chartBg.style.background = `conic-gradient(var(--color-primary) ${rate}%, var(--border-subtle) ${rate}%)`;
            }
        }

        // Form Submit Event
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTask = {
                name: document.getElementById('task-name').value,
                date: document.getElementById('task-date').value,
                time: document.getElementById('task-time').value,
                priority: document.getElementById('task-priority').value,
                desc: document.getElementById('task-desc').value,
                status: 'To Do'
            };

            tasks.push(newTask);
            saveAndRender();
            taskForm.reset();
            taskForm.classList.remove('active');
        });

        // Toggle In Progress Status
        window.toggleInProgressStatus = function(index) {
            if (tasks[index].status === 'In Progress') {
                tasks[index].status = 'To Do';
            } else {
                tasks[index].status = 'In Progress';
            }
            saveAndRender();
        };

        // Toggle Completed Checkbox
        window.toggleTaskComplete = function(index) {
            if (tasks[index].status === 'Completed') {
                tasks[index].status = 'To Do';
            } else {
                tasks[index].status = 'Completed';
            }
            saveAndRender();
        };

        // Delete Task Item
        window.deleteTaskItem = function(index) {
            tasks.splice(index, 1);
            saveAndRender();
        };

        // Initial Render
        saveAndRender();
    }
});

