document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. THEME MANAGEMENT (LIGHT / DARK MODE)
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // ==========================================
    // 2. SMART TOOL: POMODORO TIMER
    // ==========================================
    let timerInterval;
    let timeRemaining = 25 * 60; // තත්පර වලින් (25 Mins)
    let isRunning = false;

    const minsDisplay = document.getElementById('minutes');
    const secsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('timer-start');
    const resetBtn = document.getElementById('timer-reset');

    function updateTimerUI() {
        let minutes = Math.floor(timeRemaining / 60);
        let seconds = timeRemaining % 60;
        minsDisplay.textContent = minutes.toString().padStart(2, '0');
        secsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    if(startBtn) {
        startBtn.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                startBtn.textContent = 'Pause';
                startBtn.style.backgroundColor = '#5F6368'; // Pause වෙනස් පාටක්
                
                timerInterval = setInterval(() => {
                    if (timeRemaining > 0) {
                        timeRemaining--;
                        updateTimerUI();
                    } else {
                        clearInterval(timerInterval);
                        alert('Focus session complete! Take a short break.');
                        resetTimer();
                    }
                }, 1000);
            } else {
                // Pause කිරීම
                clearInterval(timerInterval);
                isRunning = false;
                startBtn.textContent = 'Start';
                startBtn.style.backgroundColor = 'var(--color-primary)';
            }
        });
    }

    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        timeRemaining = 25 * 60;
        updateTimerUI();
        if(startBtn) {
            startBtn.textContent = 'Start';
            startBtn.style.backgroundColor = 'var(--color-primary)';
        }
    }

    if(resetBtn) { resetBtn.addEventListener('click', resetTimer); }


    // ==========================================
    // 3. SMART TOOL: TASK TRACKER (LOCAL STORAGE)
    // ==========================================
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    
    // Local storage එකෙන් පරණ ටාස්ක් ටික ගන්නවා, නැත්නම් හිස් array එකක් ගන්නවා
    let tasks = JSON.parse(localStorage.getItem('student-tasks')) || [];

    function saveAndRenderTasks() {
        localStorage.setItem('student-tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        if(!taskList) return;
        taskList.innerHTML = '';
        
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <span onclick="toggleTask(${index})">${task.text}</span>
                <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
            `;
            taskList.appendChild(li);
        });
    }

    // Task එකක් ඇතුළත් කිරීම
    if(taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = taskInput.value.trim();
            if (text === '') return;
            
            tasks.push({ text: text, completed: false });
            taskInput.value = '';
            saveAndRenderTasks();
        });
    }

    // Task එකක් ඉවරයි කියලා ලකුණු කිරීම
    window.toggleTask = function(index) {
        tasks[index].completed = !tasks[index].completed;
        saveAndRenderTasks();
    };

    // Task එකක් අයින් කිරීම
    window.deleteTask = function(index) {
        tasks.splice(index, 1);
        saveAndRenderTasks();
    };

    // මුලින්ම තියෙන ටාස්ක් ටික screen එකට දානවා
    renderTasks();
});
