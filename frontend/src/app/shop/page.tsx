"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { XpBar } from "@/components/ui/xp-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { ShoppingBag, Zap, Check, Image, Frame, Sparkles, Type, Monitor, Wand2, WifiOff } from "lucide-react";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  levelRequired: number;
}

interface InventoryItem {
  itemId: string;
  equipped: boolean;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  avatar: Image,
  frame: Frame,
  animation: Sparkles,
  title: Type,
  theme: Monitor,
  effect: Wand2,
};

export default function ShopPage() {
  const { user, updateXp } = useAuthStore();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const loadData = async () => {
    try {
      const [itemsRes, invRes] = await Promise.all([
        api.getShopItems(),
        api.getInventory(),
      ]);
      setItems(itemsRes.data);
      setInventory(invRes.data);
      setOffline(false);
    } catch {
      setOffline(true);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const ownedIds = new Set(inventory.map((i) => i.itemId));
  const equippedIds = new Set(inventory.filter((i) => i.equipped).map((i) => i.itemId));

  const types = ["all", ...new Set(items.map((i) => i.type))];

  const filtered = activeTab === "all" ? items : items.filter((i) => i.type === activeTab);

  const handleBuy = async (itemId: string) => {
    setBuyingId(itemId);
    try {
      await api.buyItem(itemId);
      await loadData();
      if (user) {
        const profile = await api.getProfile();
        updateXp(profile.data.xp, profile.data.level);
      }
    } catch {}
    setBuyingId(null);
  };

  const handleEquip = async (itemId: string) => {
    try {
      await api.equipItem(itemId);
      await loadData();
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-hidden="true">
        <div className="h-8 w-44 rounded-lg bg-eduverse-surface" />
        <div className="h-24 rounded-2xl bg-eduverse-surface" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="h-56 rounded-2xl bg-eduverse-surface" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-eduverse-accent-light" />
          Shop
        </h1>
        <p className="text-eduverse-text-muted">Spend your XP on cosmetics and upgrades.</p>
      </motion.div>

      {user && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Your Balance</span>
              <span className="text-xl font-bold text-eduverse-warning flex items-center gap-1">
                <Zap className="w-5 h-5" /> {user.xp.toLocaleString()} XP
              </span>
            </div>
            <XpBar xp={user.xp} />
          </GlassCard>
        </motion.div>
      )}

      {/* Type Filter */}
      <div className="flex gap-2 flex-wrap">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            aria-pressed={activeTab === type}
            className={`seg-btn ${activeTab === type ? "active" : ""}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {offline ? (
        <EmptyState icon={WifiOff} title="Can't reach the server" message="The EduVerse API isn't responding, so the shop can't be loaded." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Nothing here yet" message="No items in this category. Check another tab or come back later." />
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
        {filtered.map((item, i) => {
          const owned = ownedIds.has(item.id);
          const equipped = equippedIds.has(item.id);
          const Icon = TYPE_ICONS[item.type] || ShoppingBag;
          const canAfford = user && user.xp >= item.price && user.level >= item.levelRequired;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15, ease: "easeOut" } }}
              transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard className={`text-center ${equipped ? "border-eduverse-accent/50 shadow-[0_0_10px_rgba(108,92,231,0.3)]" : ""}`}>
                <div className="w-16 h-16 rounded-2xl bg-eduverse-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-eduverse-accent-light" />
                </div>
                <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                <p className="text-xs text-eduverse-text-muted mb-3">{item.description}</p>
                <div className="text-xs text-eduverse-text-muted mb-3">
                  Lv.{item.levelRequired} required
                </div>
                <div className="flex items-center justify-center gap-1 text-sm font-bold text-eduverse-warning mb-4">
                  <Zap className="w-4 h-4" /> {item.price.toLocaleString()} XP
                </div>
                {owned ? (
                  <GradientButton
                    onClick={() => handleEquip(item.id)}
                    variant={equipped ? "secondary" : "ghost"}
                    className="w-full text-xs py-2"
                  >
                    {equipped ? (
                      <><Check className="w-3 h-3" /> Equipped</>
                    ) : (
                      "Equip"
                    )}
                  </GradientButton>
                ) : (
                  <GradientButton
                    onClick={() => handleBuy(item.id)}
                    disabled={!canAfford}
                    loading={buyingId === item.id}
                    className="w-full text-xs py-2"
                  >
                    Buy
                  </GradientButton>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
      )}
    </div>
  );
}
