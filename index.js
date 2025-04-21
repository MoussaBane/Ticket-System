require("dotenv").config();
const express = require("express");
const adminAuth = require("./middlewares/adminAuth");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { Parser } = require("json2csv");
const QRCode = require("qrcode");
const Ticket = require("./models/Ticket");
const adminAuthRoutes = require("./routes/auth");

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

// Les routes pour l'authentification admin
app.use("/admin", adminAuthRoutes);

// Générer 300 tickets (à appeler une seule fois)
app.get("/generate-tickets", adminAuth, async (req, res) => {
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
app.get("/validate", adminAuth, async (req, res) => {
  const { code } = req.query;
  const ticket = await Ticket.findOne({ code });

  if (!ticket) return res.send("❌ Code invalide.");
  if (ticket.isUsed) return res.send("⛔ Code déjà utilisé.");

  ticket.isUsed = true;
  ticket.usedAt = new Date();
  await ticket.save();
  res.send("✅ Code validé. Bienvenue !");
});

// Validation du ticket via QR code
app.post("/validate-ticket", adminAuth, async (req, res) => {
  const { code } = req.body;

  try {
    const ticket = await Ticket.findOne({ code });

    if (!ticket) {
      return res.json({ success: false, message: "Ticket invalide !" });
    }

    if (ticket.isUsed) {
      return res.json({ success: false, message: "Ticket déjà utilisé." });
    }

    ticket.isUsed = true;
    await ticket.save();

    return res.json({ success: true, message: "Ticket valide. Bienvenue !" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// Endpoint pour afficher tous les tickets (accessible uniquement par l'admin)
app.get("/admin/tickets", adminAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const ticketsWithQR = await Promise.all(
      tickets.map(async (ticket) => {
        const qrDataUrl = await QRCode.toDataURL(ticket.code);
        return { ...ticket.toObject(), qrUrl: qrDataUrl };
      })
    );
    res.json(ticketsWithQR);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
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
