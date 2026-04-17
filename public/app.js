let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
    const text = document.getElementById("text").value;
    const priority = document.getElementById("priority").value;
    const deadline = document.getElementById("deadline").value;

    if (!text.trim()) return;

    tasks.push({
        id: Date.now(),
        text,
        priority,
        status: "todo",
        createdAt: new Date().toLocaleString(),
        deadline
    });

    save();
    render();
    notify("Tarea creada ✔");
}

function render() {
    const search = document.getElementById("search").value.toLowerCase();
    const filter = document.getElementById("filter").value;

    const filtered = tasks.filter(t =>
        t.text.toLowerCase().includes(search) &&
        (filter === "all" || t.priority === filter)
    );

    ["todo","doing","done"].forEach(col => {
        document.getElementById(col).innerHTML =
            filtered.filter(t => t.status === col)
            .map(card)
            .join("");
    });

    updateStats();
    checkDeadlines();
}

function card(t) {
    const expired = t.deadline && new Date(t.deadline) < new Date();

    return `
        <div class="card ${t.priority}" draggable="true"
            ondragstart="drag(event)" id="${t.id}"
            style="${expired ? 'border:2px solid red' : ''}">
            
            <b>${t.text}</b><br>

            <small>📅 ${t.createdAt}</small><br>
            ${t.deadline ? `<small>⏰ ${t.deadline}</small>` : ""}

            <div class="card-actions">

                <button onclick="editTask(${t.id})">✏️</button>
                <button onclick="deleteTask(${t.id})">🗑️</button>

            </div>
        </div>
    `;
}

function drag(ev) {
    ev.dataTransfer.setData("id", ev.target.id);
}

function allow(ev) {
    ev.preventDefault();
}

function drop(ev, status) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("id");

    tasks = tasks.map(t =>
        t.id == id ? { ...t, status } : t
    );

    save();
    render();
}

function toggleTheme() {
    document.body.classList.toggle("dark");
}

function updateStats() {
    const low = tasks.filter(t=>t.priority==="low").length;
    const med = tasks.filter(t=>t.priority==="medium").length;
    const high = tasks.filter(t=>t.priority==="high").length;

    document.getElementById("stats").innerHTML =
        `🟢 ${low} | 🟡 ${med} | 🔴 ${high}`;
}

function notify(msg) {
    if (Notification.permission === "granted") {
        new Notification(msg);
    }
}

function checkDeadlines() {
    const now = new Date();

    tasks.forEach(t => {
        if (t.deadline && new Date(t.deadline) < now) {
            notify("⚠ Tarea vencida: " + t.text);
        }
    });
}
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
    notify("Tarea eliminada 🗑️");
}
function editTask(id) {
    const task = tasks.find(t => t.id === id);

    const newText = prompt("Editar tarea:", task.text);
    if (!newText || !newText.trim()) return;

    const newPriority = prompt("Prioridad (low / medium / high):", task.priority);

    tasks = tasks.map(t =>
        t.id === id
            ? { ...t, text: newText, priority: newPriority || t.priority }
            : t
    );

    save();
    render();
    notify("Tarea actualizada ✏️");
}

window.onload = () => {
    Notification.requestPermission();
    render();
};