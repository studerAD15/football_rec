import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../db.json");

function normalizePlayer(player) {
  return {
    _id: { toString: () => player.id },
    id: player.id,
    name: player.name,
    photoUrl: player.photoUrl ?? "",
    position: player.position,
    skillLevel: player.skillLevel,
    createdAt: player.createdAt ?? null,
  };
}

async function readPlayersFile() {
  const raw = await fs.readFile(dbPath, "utf-8").catch(() => "[]");
  return JSON.parse(raw);
}

async function writePlayersFile(players) {
  await fs.writeFile(dbPath, JSON.stringify(players, null, 2));
}

class JsonPlayersCollection {
  async find() {
    const players = (await readPlayersFile()).map(normalizePlayer);

    return {
      sort: ({ createdAt = 1 } = {}) => ({
        toArray: async () =>
          [...players].sort((left, right) => {
            const leftValue = left.createdAt ? new Date(left.createdAt).getTime() : 0;
            const rightValue = right.createdAt ? new Date(right.createdAt).getTime() : 0;
            return createdAt >= 0 ? leftValue - rightValue : rightValue - leftValue;
          }),
      }),
    };
  }

  async insertOne(doc) {
    const players = await readPlayersFile();
    const id = `p${Date.now()}`;

    players.push({
      id,
      name: doc.name,
      photoUrl: doc.photoUrl ?? "",
      position: doc.position,
      skillLevel: doc.skillLevel,
      createdAt: doc.createdAt ?? new Date().toISOString(),
    });

    await writePlayersFile(players);
    return { insertedId: { toString: () => id } };
  }

  async deleteOne(filter) {
    const id = filter?._id?.toString?.();
    const players = await readPlayersFile();
    const nextPlayers = players.filter((player) => player.id !== id);

    if (nextPlayers.length === players.length) {
      return { deletedCount: 0 };
    }

    await writePlayersFile(nextPlayers);
    return { deletedCount: 1 };
  }
}

const playersCollection = new JsonPlayersCollection();

export async function getDatabase() {
  return {
    collection: () => playersCollection,
  };
}

export async function getPlayersCollection() {
  return playersCollection;
}
