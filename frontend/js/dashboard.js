const API_BASE = "https://smart-city-project-y8zq.onrender.com";
const token = localStorage.getItem("token");

/* ===============================
   🔐 ADMIN AUTH CHECK (EXISTING)
================================ */
if (!token) {
  alert("Admin login required");
  window.location.href = "login.html";
}

/* ===============================
   🔐 TOKEN ROLE CHECK (SAFE ADDITION)
================================ */
let payload;
try {
  payload = JSON.parse(atob(token.split(".")[1]));

  if (payload.role !== "admin") {
    alert("Access denied. Admins only.");
    window.location.href = "report.html";
  }
} catch (err) {
  console.error("Invalid or expired token");
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

/* ===============================
   EXISTING CODE (UNCHANGED)
================================ */
const issuesDiv = document.getElementById("issues");

/* ===============================
   🔹 Load all issues
================================ */
async function loadIssues() {
  try {
    const res = await fetch(`${API_BASE}/api/issues`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // ✅ ADDITION: handle auth failure
    if (res.status === 401 || res.status === 403) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    const issues = await res.json();
    issuesDiv.innerHTML = "";

    // ✅ ADDITION: empty state
    if (!Array.isArray(issues) || issues.length === 0) {
      issuesDiv.innerHTML = "<p>No issues reported yet.</p>";
      return;
    }

    issues.forEach(issue => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <p><b>Title:</b> ${issue.title}</p>
        <p><b>Description:</b> ${issue.description}</p>
        <p><b>Category:</b> ${issue.category}</p>
        <p><b>Reported By:</b> ${issue.reportedBy?.name || "N/A"}
          (${issue.reportedBy?.email || "N/A"})</p>
        <p><b>Status:</b> ${issue.status}</p>

        ${issue.image ? `
          <img 
            src="${API_BASE}/uploads/${issue.image}" 
            width="200"
            style="margin-top:10px;border-radius:6px;"
          />
        ` : ""}

        <select onchange="updateStatus('${issue._id}', this.value)">
          <option value="">Change Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      `;

      issuesDiv.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load issues:", err);
    issuesDiv.innerHTML = "<p>⚠️ Failed to load issues</p>";
  }
}

/* ===============================
   🔹 Update issue status
================================ */
async function updateStatus(id, status) {
  if (!status) return;

  try {
    await fetch(`${API_BASE}/api/issues/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    loadIssues();
  } catch (err) {
    console.error("Failed to update status:", err);
    alert("Failed to update issue status");
  }
}

/* ===============================
   🔔 REAL-TIME UPDATES (SAFE)
================================ */
if (typeof io !== "undefined") {
  const socket = io(API_BASE, {
    transports: ["websocket"],
    reconnectionAttempts: 5
  });

  socket.on("connect", () => {
    console.log("🔌 Admin socket connected:", socket.id);
  });

  socket.on("issueUpdated", () => {
    console.log("🔄 Issue updated (real-time)");
    loadIssues();
  });

  socket.on("connect_error", () => {
    console.warn("⚠️ Socket connection delayed (Render sleep)");
  });
}

/* ===============================
   🚀 INITIAL LOAD
================================ */
loadIssues();
