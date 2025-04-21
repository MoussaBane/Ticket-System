require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { Parser } = require("json2csv");
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

// Endpoint pour afficher tous les tickets (accessible uniquement par l'admin)
app.get("/admin/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find(); // Récupère tous les tickets
    res.json(tickets); // Retourne les tickets en JSON
  } catch (err) {
    res.status(500).send("Erreur lors de la récupération des tickets.");
  }
});

// Endpoint pour marquer un ticket comme utilisé (accessible uniquement par l'admin)
app.post("/admin/tickets/:id/use", async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { isUsed: true },
      { new: true }
    );
    res.json(ticket);
  } catch (err) {
    res.status(500).send("Erreur lors de la mise à jour du ticket.");
  }
});

// Exportation des tickets au format CSV (accessible uniquement par l'admin)
app.get("/admin/export-csv", async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const fields = ["_id", "code", "isUsed", "createdAt"];
    const opts = { fields };

    const parser = new Parser(opts);
    const csv = parser.parse(tickets);

    res.header("Content-Type", "text/csv");
    res.attachment("tickets.csv");
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l’export");
  }
});
  

// Démarrer le serveur
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
