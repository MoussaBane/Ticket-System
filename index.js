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
const managerRoutes = require("./routes/manager");
const adminRoutes = require("./routes/admin");
const verifyToken = require("./middlewares/verifyToken");
const roleAuth = require("./middlewares/roleAuth");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static public folder
app.use(express.static(path.join(__dirname, "public")));

// View engine for PDF templates
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Les routes pour l'authentification (login/register)
app.use("/admin", adminAuthRoutes);

// API routes for manager and admin workflows
app.use("/api/manager", managerRoutes);
app.use("/api/admin", adminRoutes);

// Générer 200 tickets
app.post("/generate-tickets", adminAuth, async (req, res) => {
  try {
    const tickets = Array.from({ length: 200 }, () => ({}));
    await Ticket.insertMany(tickets);
    res.status(201).send("200 tickets générés");
  } catch (error) {
    console.error("Erreur lors de la génération des tickets:", error);
    res.status(500).send("Erreur lors de la génération des tickets");
  }
});



// Vérification d'un code
app.get("/validate", adminAuth, async (req, res) => {
  const { code } = req.query;

  try {
    const ticket = await Ticket.findOne({ code });
    if (!ticket)
      return res
        .status(404)
        .json({ message: "❌ Code invalide. Veuillez réessayer." });

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

// Supprimer un seul ticket par ID
app.delete("/tickets/:id", adminAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const deleted = await Ticket.findByIdAndDelete(ticketId);

    if (!deleted) {
      return res.status(404).send("Ticket non trouvé.");
    }

    res.status(200).send("Ticket supprimé avec succès.");
  } catch (error) {
    console.error("Erreur lors de la suppression du ticket :", error);
    res.status(500).send("Erreur serveur lors de la suppression.");
  }
});

// Supprimer tous les tickets
app.post("/delete-all-tickets", adminAuth, async (req, res) => {
  try {
    const result = await Ticket.deleteMany({});
    res.status(200).send(`${result.deletedCount} tickets supprimés.`);
  } catch (error) {
    console.error("Erreur lors de la suppression des tickets :", error);
    res.status(500).send("Erreur serveur lors de la suppression.");
  }
});

// Exporter en CSV
app.get("/admin/export-csv", adminAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const fields = [
      "_id",
      "ticketNumber",
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

