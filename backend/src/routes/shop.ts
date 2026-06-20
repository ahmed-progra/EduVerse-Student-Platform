import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { getCached, setCache } from "../lib/cache";

const router = Router();

const SHOP_ITEMS_KEY = "shop:items";

router.get("/items", async (_req: Request, res: Response) => {
  try {
    const cached = getCached<any[]>(SHOP_ITEMS_KEY);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }
    const items = await prisma.shopItem.findMany({ orderBy: { price: "asc" } });
    setCache(SHOP_ITEMS_KEY, items);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch shop items" });
  }
});

router.post("/buy/:itemId", requireAuth, async (req: Request, res: Response) => {
  try {
    const itemId = req.params.itemId as string;
    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item) {
      res.status(404).json({ success: false, error: "Item not found" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    if (user.level < item.levelRequired) {
      res.status(400).json({ success: false, error: "Level too low" });
      return;
    }

    if (user.coins < item.price) {
      res.status(400).json({ success: false, error: "Not enough coins" });
      return;
    }

    const owned = await prisma.userInventory.findUnique({
      where: { userId_itemId: { userId: user.id, itemId: item.id } },
    });
    if (owned) {
      res.status(400).json({ success: false, error: "Already owned" });
      return;
    }

    // Atomic: the conditional decrement and inventory insert succeed or fail
    // together, so concurrent purchases can't double-spend coins. Coins are a
    // separate spendable currency — XP (level + leaderboard) is never touched.
    await prisma.$transaction(async (tx) => {
      const charged = await tx.user.updateMany({
        where: { id: user.id, coins: { gte: item.price } },
        data: { coins: { decrement: item.price } },
      });
      if (charged.count === 0) throw new Error("INSUFFICIENT_COINS");
      await tx.userInventory.create({
        data: { userId: user.id, itemId: item.id, equipped: false },
      });
    });

    res.json({ success: true, data: { message: "Purchased successfully", item, coins: user.coins - item.price } });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_COINS") {
      res.status(400).json({ success: false, error: "Not enough coins" });
      return;
    }
    res.status(500).json({ success: false, error: "Purchase failed" });
  }
});

router.post("/equip/:itemId", requireAuth, async (req: Request, res: Response) => {
  try {
    const itemId = req.params.itemId as string;
    const inv = await prisma.userInventory.findUnique({
      where: { userId_itemId: { userId: req.userId!, itemId } },
    });
    if (!inv) {
      res.status(404).json({ success: false, error: "Item not in inventory" });
      return;
    }

    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });

    await prisma.userInventory.updateMany({
      where: { userId: req.userId!, item: { type: item?.type } },
      data: { equipped: false },
    });

    await prisma.userInventory.update({
      where: { userId_itemId: { userId: req.userId!, itemId } },
      data: { equipped: true },
    });

    res.json({ success: true, data: { message: "Equipped successfully" } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Equip failed" });
  }
});

router.get("/inventory", requireAuth, async (req: Request, res: Response) => {
  try {
    const inventory = await prisma.userInventory.findMany({
      where: { userId: req.userId! },
      include: { item: true },
    });
    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch inventory" });
  }
});

export default router;
