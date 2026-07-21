// System Logic Controller
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

    // 3. Animated Pomodoro Timer with Custom Input Fix
    const minsDisplay = document.getElementById('minutes');
    const secsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('timer-start');
    const resetBtn = document.getElementById('timer-reset');
    const timeInput = document.getElementById('custom-time-input');
    const progressRing = document.getElementById('timer-progress-ring');
    
    if (minsDisplay && startBtn) {
        let timerInterval;
        let totalTime = (timeInput && timeInput.value ? parseInt(timeInput.value) : 25) * 60; 
        let timeRemaining = totalTime; 
        let isRunning = false;
        const circleCircumference = 440; 

        function updateTimerUI() {
            let m = Math.floor(timeRemaining / 60);
            let s = timeRemaining % 60;
            minsDisplay.textContent = m.toString().padStart(2, '0');
            secsDisplay.textContent = s.toString().padStart(2, '0');
            
            // Sync SVG Ring
            if (progressRing) {
                let progressPercent = totalTime > 0 ? (timeRemaining / totalTime) : 0;
                let dashOffset = circleCircumference - (progressPercent * circleCircumference);
                progressRing.style.strokeDashoffset = dashOffset;
            }
        }

        // Fix: Use 'input' event for real-time update when typing
        if (timeInput) {
            timeInput.addEventListener('input', () => {
                if(!isRunning) {
                    let val = parseInt(timeInput.value);
                    if(isNaN(val) || val < 1) return; // Prevent errors if field is empty or negative
                    totalTime = val * 60;
                    timeRemaining = totalTime;
                    updateTimerUI();
                }
            });
        }

        startBtn.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                startBtn.textContent = 'Pause';
                startBtn.style.backgroundColor = '#5F6368';
                if(timeInput) timeInput.disabled = true;
                
                timerInterval = setInterval(() => {
                    if (timeRemaining > 0) {
                        timeRemaining--;
                        updateTimerUI();
                    } else {
                        clearInterval(timerInterval);
                        alert('Focus session complete! Time for a break.');
                        resetTimer();
                    }
                }, 1000);
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                startBtn.textContent = 'Resume';
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

    // 4. Advanced Task Manager (Animations & Charts)
    const toggleFormBtn = document.getElementById('toggle-task-form-btn');
    const taskForm = document.getElementById('task-form');
    const tableBody = document.getElementById('task-list-body');

    if (tableBody) {
        let tasks = JSON.parse(localStorage.getItem('advanced-tasks')) || [];

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

        // Render Table logic
        function renderPlannerTable(isInitial = false) {
            tableBody.innerHTML = '';
            tasks.forEach((task, index) => {
                const tr = document.createElement('tr');
                tr.className = 'row-transition';
                
                // Add pop-up fade in animation for re-renders
                if (!isInitial) tr.classList.add('row-fading-in'); 
                
                const isDone = task.status === 'Completed';
                if (isDone) tr.classList.add('completed-row');

                let dateFormatted = new Date(task.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

                tr.innerHTML = `
                    <td><input type="checkbox" ${isDone ? 'checked' : ''} onclick="animateRowChange(${index}, 'checkbox')" style="cursor:pointer; width:18px; height:18px;"></td>
                    <td style="font-weight: 500;">${task.name}</td>
                    <td>${dateFormatted} <br> <small style="color: var(--text-muted);">${task.time}</small></td>
                    <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
                    <td>
                        <button class="btn-status-toggle ${task.status === 'In Progress' ? 'in-progress' : ''}" 
                                ${isDone ? 'disabled' : ''} 
                                onclick="animateRowChange(${index}, 'status')">
                            ${task.status === 'In Progress' ? 'Working' : 'To Do'}
                        </button>
                    </td>
                    <td style="color: var(--text-muted);">${task.desc || '-'}</td>
                    <td style="text-align: right;">
                        <button class="delete-btn-with-icon" onclick="confirmDelete(${index})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }

        function updateCharts() {
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

        // Animation Wrapper
        window.animateRowChange = function(index, type) {
            let row = tableBody.children[index];
            
            // 1. Add class to start fade out (fades up slightly)
            row.classList.add('row-fading-out'); 
            
            // 2. Wait for CSS transition (400ms) to complete before re-ordering
            setTimeout(() => {
                if (type === 'checkbox') {
                    tasks[index].status = tasks[index].status === 'Completed' ? 'To Do' : 'Completed';
                } else if (type === 'status') {
                    tasks[index].status = tasks[index].status === 'In Progress' ? 'To Do' : 'In Progress';
                }
                
                sortTasks();
                localStorage.setItem('advanced-tasks', JSON.stringify(tasks));
                
                // 3. Render table. (isInitial = false adds the pop-up fade in animation)
                renderPlannerTable(false); 
                updateCharts();
            }, 400); 
        }

        window.confirmDelete = function(index) {
            let row = tableBody.children[index];
            row.classList.add('row-fading-out'); // Animate out before delete
            
            setTimeout(() => {
                if(confirm("Are you sure you want to delete this task?")) {
                    tasks.splice(index, 1);
                    sortTasks();
                    localStorage.setItem('advanced-tasks', JSON.stringify(tasks));
                    renderPlannerTable(false);
                    updateCharts();
                } else {
                    renderPlannerTable(false); // Restore if cancelled
                }
            }, 400);
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
                renderPlannerTable(false); // Animate new entry
                updateCharts();
            });
        }

        sortTasks();
        renderPlannerTable(true); // isInitial = true (no pop-up animation on first load)
        updateCharts();
    }
});

