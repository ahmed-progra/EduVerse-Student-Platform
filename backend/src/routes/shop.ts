import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/items", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.shopItem.findMany({ orderBy: { price: "asc" } });
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

    if (user.xp < item.price) {
      res.status(400).json({ success: false, error: "Not enough XP" });
      return;
    }

    const owned = await prisma.userInventory.findUnique({
      where: { userId_itemId: { userId: user.id, itemId: item.id } },
    });
    if (owned) {
      res.status(400).json({ success: false, error: "Already owned" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { xp: user.xp - item.price },
    });

    await prisma.userInventory.create({
      data: { userId: user.id, itemId: item.id, equipped: false },
    });

    res.json({ success: true, data: { message: "Purchased successfully", item } });
  } catch (err) {
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
