const API_BASE = "https://smart-city-project-y8zq.onrender.com";
const issuesDiv = document.getElementById("issues");

// 🔐 Check admin token
const token = localStorage.getItem("token");
if (!token) {
  alert("Admin login required");
  window.location.href = "login.html";
}

// 🧠 Fetch all issues
async function loadIssues() {
  const res = await fetch(`${API_BASE}/api/issues`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const issues = await res.json();
  issuesDiv.innerHTML = "";

  issues.forEach(issue => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${issue.title}</h3>
      <p><b>Description:</b> ${issue.description}</p>
      <p><b>Category:</b> ${issue.category}</p>
      <p><b>Status:</b> ${issue.status}</p>
      <p><b>Location:</b> ${issue.location.lat}, ${issue.location.lng}</p>

      <select onchange="updateStatus('${issue._id}', this.value)">
        <option value="">Change status</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="resolved">Resolved</option>
      </select>
    `;

    issuesDiv.appendChild(div);
  });
}

// 🔁 Update issue status
async function updateStatus(id, status) {
  if (!status) return;

  await fetch(`${API_BASE}/api/issues/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  loadIssues();
}

// 🔔 Real-time updates
const socket = io(API_BASE);
socket.on("issueUpdated", () => {
  loadIssues();
});

// 🚀 Load on page open
loadIssues();
