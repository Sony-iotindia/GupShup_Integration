import express from "express";
import dotenv from "dotenv";
import whatsappRoutes from "./routes/whatsapp.routes.js";
import { testGupshupAuth } from "./services/gupshup.service.js";


dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/whatsapp", whatsappRoutes);

//testGupshupAuth();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "WhatsApp service is running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});