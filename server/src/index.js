import express from "express";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";
import { getPlayersCollection } from "./lib/mongo.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const validPositions = new Set(["Striker", "Midfielder", "Defender", "GK"]);
const validLevels = new Set(["Beginner", "Intermediate", "Pro"]);
const adminApiKey = process.env.ADMIN_API_KEY;
const frontendUrl = process.env.FRONTEND_URL;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

app.use(
  cors({
    origin: frontendUrl ? [frontendUrl] : true,
  }),
);
app.use(express.json());

function mapPlayer(player) {
  return {
    id: player._id.toString(),
    name: player.name,
    photoUrl: player.photoUrl,
    position: player.position,
    skillLevel: player.skillLevel,
    imagePublicId: player.imagePublicId ?? "",
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

function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "football-team-balancer",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
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

  if (!name || !validPositions.has(position) || !validLevels.has(skillLevel)) {
    return response.status(400).json({ error: "Invalid player payload." });
  }

  let uploadedImage;

  try {
    if (request.file) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return response.status(503).json({ error: "Cloudinary is not configured." });
      }

      uploadedImage = await uploadToCloudinary(request.file.buffer);
    }

    const finalPhotoUrl = uploadedImage?.secure_url || String(photoUrl).trim();
    const playersCollection = await getPlayersCollection();
    const player = {
      name: String(name).trim(),
      photoUrl: finalPhotoUrl,
      imagePublicId: uploadedImage?.public_id || "",
      position,
      skillLevel,
      createdAt: new Date(),
    };

    const result = await playersCollection.insertOne(player);

    return response.status(201).json({
      id: result.insertedId.toString(),
      name: player.name,
      photoUrl: player.photoUrl,
      imagePublicId: player.imagePublicId,
      position: player.position,
      skillLevel: player.skillLevel,
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      await cloudinary.uploader.destroy(uploadedImage.public_id).catch(() => {});
    }

    console.error("Failed to save player", {
      message: error?.message,
      name: error?.name,
      httpCode: error?.http_code,
      adminUpload: Boolean(request.file),
    });

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

    if (targetPlayer?.imagePublicId) {
      await cloudinary.uploader.destroy(targetPlayer.imagePublicId).catch(() => {});
    }

    return response.status(204).send();
  } catch (error) {
    return response.status(400).json({ error: "Invalid player id." });
  }
});

async function startServer() {
  app.listen(port, () => {
    console.log(`Football Team Balancer API listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
