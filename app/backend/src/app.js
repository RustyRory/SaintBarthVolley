import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Route test
app.get("/", (req, res) => {
  res.send("API Volley fonctionne !");
});

// Importer les routes
const usersRoutes = require("./routes/users");
const clubsRoutes = require("./routes/clubs");

app.use("/api/users", usersRoutes);
app.use("/api/clubs", clubsRoutes);

export default app;
