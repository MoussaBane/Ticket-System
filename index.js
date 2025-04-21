require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Ticket = require("./models/Ticket");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ticketsystemdb.6gbpr2r.mongodb.net/TicketSystemDB?retryWrites=true&w=majority&appName=TicketSystemDB`;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.log(err));

// Générer 300 tickets (à appeler une seule fois)
app.get("/generate-tickets", async (req, res) => {
  const codes = [];
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 0; i < 300; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    codes.push({ code });
  }

  await Ticket.insertMany(codes);
  res.send("300 tickets générés");
});

// Vérification d’un code
app.get("/validate", async (req, res) => {
  const { code } = req.query;
  const ticket = await Ticket.findOne({ code });

  if (!ticket) return res.send("❌ Code invalide.");
  if (ticket.isUsed) return res.send("⛔ Code déjà utilisé.");

  ticket.isUsed = true;
  ticket.usedAt = new Date();
  await ticket.save();
  res.send("✅ Code validé. Bienvenue !");
});

// Démarrer le serveur
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
