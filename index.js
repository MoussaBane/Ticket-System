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

// Les routes pour l'authentification admin
app.use("/admin", adminAuthRoutes);

// Générer 300 tickets
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

// Vérification d'un code
app.get("/validate", adminAuth, async (req, res) => {
  const { code } = req.query;

  try {
    const ticket = await Ticket.findOne({ code });
    if (!ticket) return res.status(404).json({ message: "❌ Code invalide" });

    if (ticket.isUsed) {
      return res.json({
        success: false,
        message: `⛔ Code déjà utilisé le ${ticket.usedAt.toLocaleString()}`,
        usedAt: ticket.usedAt,
      });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      { isUsed: true, usedAt: new Date() },
      { new: true }
    );

    res.json({
      success: true,
      message: "✅ Code validé. Bienvenue !",
      ticket: updatedTicket,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
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
      return res.json({
        success: false,
        message: `Ticket déjà utilisé le ${ticket.usedAt.toLocaleString()}`,
      });
    }

    ticket.isUsed = true;
    ticket.usedAt = new Date();
    await ticket.save();

    return res.json({
      success: true,
      message: "Ticket valide. Bienvenue !",
      usedAt: ticket.usedAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// Récupérer un ticket spécifique
app.get("/admin/tickets/:id", adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket non trouvé" });
    }

    const qrUrl = await QRCode.toDataURL(ticket.code);
    res.json({ ...ticket.toObject(), qrUrl });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Mettre à jour un ticket
app.put("/admin/tickets/:id", adminAuth, async (req, res) => {
  try {
    const { isUsed, isAssigned, assignedTo } = req.body;
    const update = { isUsed, isAssigned, assignedTo };

    // Gestion de isUsed et usedAt
    if (isUsed) {
      update.usedAt = new Date();
    } else {
      update.usedAt = null;
    }

    // Gestion de isAssigned et assignedAt
    if (isAssigned && assignedTo && assignedTo.trim() !== "") {
      update.isAssigned = true;
      update.assignedAt = update.assignedAt || new Date();
    } else {
      update.isAssigned = false;
      update.assignedTo = null;
      update.assignedAt = null;
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    res.json(ticket);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour",
      error: err.message,
    });
  }
});

// Assigner un ticket
app.put("/admin/tickets/:id/assign", adminAuth, async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        isAssigned: true,
        assignedTo,
        assignedAt: new Date(),
      },
      { new: true }
    );

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'assignation" });
  }
});

// Valider la présence
app.put("/admin/tickets/:id/validate", adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        isUsed: true,
        usedAt: new Date(),
      },
      { new: true }
    );

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la validation" });
  }
});

// Lister tous les tickets
app.get("/admin/tickets", adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status === "used") {
      query.isUsed = true;
    } else if (status === "unused") {
      query.isUsed = false;
    } else if (status === "assigned") {
      query.isAssigned = true;
    } else if (status === "unassigned") {
      query.isAssigned = false;
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });

    const ticketsWithQR = await Promise.all(
      tickets.map(async (ticket) => {
        const qrDataUrl = await QRCode.toDataURL(ticket.code);
        return {
          ...ticket.toObject(),
          qrUrl: qrDataUrl,
        };
      })
    );

    res.json(ticketsWithQR);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// Exporter en CSV
app.get("/admin/export-csv", adminAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const fields = [
      "_id",
      "code",
      "isAssigned",
      "assignedTo",
      "assignedAt",
      "isUsed",
      "usedAt",
      "createdAt",
    ];
    const opts = { fields };

    const parser = new Parser(opts);
    const csv = parser.parse(tickets);

    res.header("Content-Type", "text/csv");
    res.attachment("tickets.csv");
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'export");
  }
});

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.pznxahw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose
  .connect(uri)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ Erreur de connexion MongoDB:", err));

// Démarrer le serveur
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(
    `Serveur en ligne sur le port ${PORT} : http://localhost:${PORT}`
  );
});

