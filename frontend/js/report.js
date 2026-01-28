/* ===============================
   🔐 GLOBAL AUTH GUARD (MUST BE FIRST)
================================ */
const authToken = localStorage.getItem("token");

if (!authToken) {
  alert("Please login or register first");
  window.location.href = "login.html";
  throw new Error("Blocked: user not logged in");
}

const form = document.getElementById("issueForm");

if (!form) {
  console.error("issueForm not found");
}

/* ===============================
   FORM SUBMIT
================================ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 1️⃣ Check map location
  if (window.selectedLat === null || window.selectedLng === null) {
    alert("❗ Please select a location on the map");
    return;
  }

  // 2️⃣ Get form values
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const imageFile = document.getElementById("image")?.files[0];

  if (!title || !description || !category) {
    alert("❗ All fields are required");
    return;
  }

  // 3️⃣ Get token
  const token = localStorage.getItem("token");
  if (!token) {
    alert("❌ Please login first");
    window.location.href = "login.html";
    return;
  }

  try {
    /* ===============================
       4️⃣ CREATE ISSUE
    ================================ */
    const issueRes = await fetch(
      "https://smart-city-project-y8zq.onrender.com/api/issues",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          lat: window.selectedLat,
          lng: window.selectedLng
        })
      }
    );

    const issueData = await issueRes.json();
    console.log("📦 Issue response:", issueData);

    if (!issueRes.ok) {
      alert(issueData.msg || "❌ Issue creation failed");
      return;
    }

    /* ===============================
       5️⃣ UPLOAD IMAGE (OPTIONAL)
    ================================ */
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      const imgRes = await fetch(
        `https://smart-city-project-y8zq.onrender.com/api/issues/${issueData.issue._id}/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!imgRes.ok) {
        console.warn("⚠️ Image upload failed (issue still created)");
      }
    }

    /* ===============================
       6️⃣ SUCCESS UI RESET
    ================================ */
    alert("✅ Issue reported successfully");

    form.reset();
    document.getElementById("coords").innerText = "None";
    window.selectedLat = null;
    window.selectedLng = null;

  } catch (error) {
    console.error("❌ Network / Server error:", error);
    alert("❌ Server error. Please try again in 30 seconds.");
  }
});

/* ===============================
   SOCKET.IO (OPTIONAL / SAFE)
================================ */
if (typeof io !== "undefined") {
  const socket = io("https://smart-city-project-y8zq.onrender.com", {
    transports: ["websocket"],
    reconnectionAttempts: 5
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("issueUpdated", (issue) => {
    alert(`🔔 Issue "${issue.title}" updated to ${issue.status}`);
  });

  socket.on("connect_error", () => {
    console.warn("⚠️ Socket delayed (Render free tier sleep)");
  });
}

console.log("✅ report.js loaded successfully");
