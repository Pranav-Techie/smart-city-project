// Connect to backend socket server
const socket = io("http://localhost:8080");

// When backend sends update
socket.on("issueUpdated", (issue) => {
  console.log("🔔 Real-time update received:", issue);

  alert(
    `Issue "${issue.title}" status changed to ${issue.status}`
  );
});

// Optional: confirm connection
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});
