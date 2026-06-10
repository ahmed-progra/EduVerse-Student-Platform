"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { XpBar } from "@/components/ui/xp-bar";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { ShoppingBag, Zap, Check, Image, Frame, Sparkles, Type, Monitor, Wand2 } from "lucide-react";

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
    } catch {}
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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-eduverse-accent border-t-transparent rounded-full animate-spin" />
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
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              activeTab === type ? "bg-eduverse-accent text-white" : "bg-white/5 text-eduverse-text-muted hover:bg-white/10"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item, i) => {
          const owned = ownedIds.has(item.id);
          const equipped = equippedIds.has(item.id);
          const Icon = TYPE_ICONS[item.type] || ShoppingBag;
          const canAfford = user && user.xp >= item.price && user.level >= item.levelRequired;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
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
      </div>
    </div>
  );
}
