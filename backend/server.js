// ================= IMPORTS =================
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");

// ✅ SOCKET.IO IMPORTS
const http = require("http");
const { Server } = require("socket.io");
const socket = require("./socket");

// ================= APP SETUP =================
const app = express();

// ================= CONNECT DATABASE =================
connectDB();

// ================= MIDDLEWARES =================
app.use(cors());
app.use(express.json());

// 🔍 Log every request (debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ================= BASIC TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ================= PUBLIC ROUTES =================
app.use("/api/auth", require("./routes/auth"));

// ================= PROTECTED ROUTES =================
app.use("/api/issues", authMiddleware, require("./routes/issues"));

app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    msg: "Welcome",
    user: req.user
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ msg: "Internal Server Error" });
});

// ================= SOCKET.IO SETUP =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// ✅ INITIALIZE SOCKET SAFELY
socket.init(io);

// 🔌 Handle socket connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
