import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { getPlayersCollection } from "./lib/mongo.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const validPositions = new Set(["Striker", "Midfielder", "Defender", "GK"]);
const validLevels = new Set(["Beginner", "Intermediate", "Pro"]);
const adminApiKey = process.env.ADMIN_API_KEY;
const frontendUrl = process.env.FRONTEND_URL;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(__dirname, "../uploads");

app.use(
  cors({
    origin: frontendUrl ? [frontendUrl] : true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: async (_request, _file, callback) => {
    await fs.mkdir(uploadsDir, { recursive: true });
    callback(null, uploadsDir);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase() || ".png";
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

function mapPlayer(player) {
  return {
    id: player._id.toString(),
    name: player.name,
    photoUrl: player.photoUrl,
    position: player.position,
    skillLevel: player.skillLevel,
  };
}

async function listPlayers() {
  const playersCollection = await getPlayersCollection();
  const cursor = await playersCollection.find({});
  return cursor.sort({ createdAt: 1 }).toArray();
}

function requireAdmin(request, response, next) {
  if (!adminApiKey) {
    return response.status(503).json({ error: "Admin API is not configured." });
  }

  const providedKey = request.header("x-admin-key");

  if (providedKey !== adminApiKey) {
    return response.status(401).json({ error: "Unauthorized." });
  }

  return next();
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, database: process.env.MONGODB_DB_NAME || "football_team_balancer" });
});

app.get("/api/players", async (_request, response) => {
  try {
    const players = await listPlayers();
    response.json(players.map(mapPlayer));
  } catch (error) {
    response.status(500).json({ error: "Failed to load players." });
  }
});

app.post("/api/admin/players", requireAdmin, upload.single("photo"), async (request, response) => {
  const { name, photoUrl = "", position, skillLevel } = request.body;
  const uploadedPhotoPath = request.file ? `/uploads/${request.file.filename}` : "";
  const finalPhotoUrl = uploadedPhotoPath || String(photoUrl).trim();

  if (!name || !validPositions.has(position) || !validLevels.has(skillLevel)) {
    if (request.file) {
      await fs.unlink(request.file.path).catch(() => {});
    }
    return response.status(400).json({ error: "Invalid player payload." });
  }

  try {
    const playersCollection = await getPlayersCollection();
    const player = {
      name: String(name).trim(),
      photoUrl: finalPhotoUrl,
      position,
      skillLevel,
      createdAt: new Date(),
    };

    const result = await playersCollection.insertOne(player);

    return response.status(201).json({
      id: result.insertedId.toString(),
      name: player.name,
      photoUrl: player.photoUrl,
      position: player.position,
      skillLevel: player.skillLevel,
    });
  } catch (error) {
    if (request.file) {
      await fs.unlink(request.file.path).catch(() => {});
    }
    return response.status(500).json({ error: "Failed to save player." });
  }
});

app.delete("/api/admin/players/:id", requireAdmin, async (request, response) => {
  try {
    const existingPlayers = await listPlayers();
    const targetPlayer = existingPlayers.find((player) => player._id.toString() === request.params.id);
    const playersCollection = await getPlayersCollection();
    const result = await playersCollection.deleteOne({
      _id: { toString: () => request.params.id },
    });

    if (result.deletedCount === 0) {
      return response.status(404).json({ error: "Player not found." });
    }

    if (targetPlayer?.photoUrl?.startsWith("/uploads/")) {
      const targetPath = path.resolve(uploadsDir, path.basename(targetPlayer.photoUrl));
      await fs.unlink(targetPath).catch(() => {});
    }

    return response.status(204).send();
  } catch (error) {
    return response.status(400).json({ error: "Invalid player id." });
  }
});

async function startServer() {
  await fs.mkdir(uploadsDir, { recursive: true });
  app.listen(port, () => {
    console.log(`Football Team Balancer API listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
