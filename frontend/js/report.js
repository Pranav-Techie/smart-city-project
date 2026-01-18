const form = document.getElementById("issueForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 1️⃣ Check location
  if (!window.selectedLat || !window.selectedLng) {
    alert("Please select location on map");
    return;
  }

  // 2️⃣ Get form values
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;

  // 3️⃣ Get token
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You are not logged in");
    return;
  }

  try {
    // 4️⃣ Send request
    const response = await fetch("http://localhost:8080/api/issues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description,
        category,
        lat: window.selectedLat,
        lng: window.selectedLng
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.msg || "Something went wrong");
      return;
    }

    alert("✅ Issue reported successfully");

    form.reset();
    document.getElementById("coords").innerText = "None";

  } catch (error) {
    console.error(error);
    alert("Server error");
  }
});

// ✅ Phase 10 ready
console.log("report.js loaded successfully");

if (typeof io !== "undefined") {
  const socket = io("http://localhost:8080");

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("issueUpdated", (issue) => {
    alert(`🔔 Issue "${issue.title}" status updated to ${issue.status}`);
  });
}
