document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. THEME MANAGEMENT (Dark / Light)
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // ==========================================
    // 2. PRODUCTIVITY TIMER (Pomodoro)
    // ==========================================
    const minsDisplay = document.getElementById('minutes');
    const secsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('timer-start');
    const resetBtn = document.getElementById('timer-reset');

    if (minsDisplay && secsDisplay && startBtn && resetBtn) {
        let timerInterval;
        let timeRemaining = 25 * 60; 
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
                startBtn.textContent = 'Start';
                startBtn.style.backgroundColor = 'var(--color-primary)';
            }
        });

        function resetTimer() {
            clearInterval(timerInterval);
            isRunning = false;
            timeRemaining = 25 * 60;
            updateTimerUI();
            startBtn.textContent = 'Start';
            startBtn.style.backgroundColor = 'var(--color-primary)';
        }

        resetBtn.addEventListener('click', resetTimer);
    }


    // ==========================================
    // 3. ADVANCED TASK TRACKER (With Table & Sort)
    // ==========================================
    const taskForm = document.getElementById('task-form');
    const tableBody = document.getElementById('task-list-body');
    
    if (taskForm && tableBody) {
        let tasks = JSON.parse(localStorage.getItem('advanced-tasks')) || [];

        function saveAndRenderTasks() {
            // Sort tasks by Date and Time
            tasks.sort((a, b) => {
                let dateA = new Date(a.date + 'T' + a.time);
                let dateB = new Date(b.date + 'T' + b.time);
                return dateA - dateB;
            });
            
            localStorage.setItem('advanced-tasks', JSON.stringify(tasks));
            renderTable();
        }

        function renderTable() {
            tableBody.innerHTML = '';
            
            tasks.forEach((task, index) => {
                const tr = document.createElement('tr');
                if (task.completed) tr.className = 'completed-row';
                
                // Format Date nicely
                let formattedDate = new Date(task.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                
                tr.innerHTML = `
                    <td>
                        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${index})" style="cursor:pointer; width: 18px; height: 18px;">
                    </td>
                    <td style="font-weight: 500;">${task.name}</td>
                    <td>${formattedDate} <br> <small style="color: var(--text-muted);">${task.time}</small></td>
                    <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
                    <td style="color: var(--text-muted);">${task.desc || '-'}</td>
                    <td>
                        <button class="btn-secondary" onclick="deleteTaskRow(${index})" style="padding: 6px 12px; font-size: 0.8rem; border: none; color: #D93025; background: transparent; cursor: pointer;">Delete</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }

        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newTask = {
                name: document.getElementById('task-name').value,
                date: document.getElementById('task-date').value,
                time: document.getElementById('task-time').value,
                priority: document.getElementById('task-priority').value,
                desc: document.getElementById('task-desc').value,
                completed: false
            };
            
            tasks.push(newTask);
            saveAndRenderTasks();
            taskForm.reset(); // Clear the form
        });

        window.toggleTaskStatus = function(index) {
            tasks[index].completed = !tasks[index].completed;
            saveAndRenderTasks();
        };

        window.deleteTaskRow = function(index) {
            tasks.splice(index, 1);
            saveAndRenderTasks();
        };

        // Initial render
        renderTable();
    }
});
