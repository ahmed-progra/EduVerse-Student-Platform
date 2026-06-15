"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { XpBar } from "@/components/ui/xp-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import { api } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { ShoppingBag, Coins, Check, Image, Frame, Sparkles, Type, Monitor, Wand2, WifiOff } from "lucide-react";

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
  const { user, updateCoins } = useAuthStore();
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
      const res = await api.buyItem(itemId);
      api.clearCache();
      await loadData();
      updateCoins(res.data.coins);
    } catch {}
    setBuyingId(null);
  };

  const handleEquip = async (itemId: string) => {
    try {
      await api.equipItem(itemId);
      api.clearCache();
      await loadData();
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-28 rounded-[var(--radius-button)] bg-eduverse-surface animate-pulse" />
        <div className="h-28 rounded-[var(--radius-card)] bg-eduverse-surface animate-pulse" />
        <SkeletonCardGrid count={8} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 font-display">
          <ShoppingBag className="w-5 h-5 text-eduverse-accent-light" />
          Shop
        </h1>
        <p className="text-eduverse-text-muted">Spend your coins on cosmetics and upgrades. Buying never costs you levels or rank.</p>
      </motion.div>

      {user && (
        <div className="section-label">
          <span className="section-label-prefix">//</span> Balance
        </div>
      )}

      {/* Balance Card */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-mono text-eduverse-text-muted uppercase tracking-wider mb-1">Your Balance</div>
                <div className="balance-card-amount">
                  <Coins className="w-6 h-6" aria-hidden="true" />
                  {user.coins.toLocaleString()}
                  <span className="text-base font-semibold text-eduverse-text-muted">coins</span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs text-eduverse-text-muted mb-1">Level</div>
                <div className="text-2xl font-bold font-mono text-eduverse-accent-light">{user.level}</div>
              </div>
            </div>
            <XpBar xp={user.xp} />
          </GlassCard>
        </motion.div>
      )}

      <div className="section-label">
        <span className="section-label-prefix">//</span> Filter
      </div>

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

      <div className="section-label">
        <span className="section-label-prefix">//</span> Shop Items
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
              const canAfford = user && user.coins >= item.price && user.level >= item.levelRequired;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15, ease: "easeOut" } }}
                  transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <GlassCard className={`text-center ${equipped ? "shop-equipped-ring" : ""}`}>
                    <div className="shop-item-icon">
                      <Icon className="w-8 h-8 text-eduverse-accent-light" />
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-eduverse-text">{item.name}</h3>
                    <p className="text-xs text-eduverse-text-muted mb-2 leading-relaxed">{item.description}</p>
                    <div className="text-[11px] text-eduverse-text-muted mb-3 font-mono">
                      Lv.{item.levelRequired} required
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-eduverse-warning mb-4">
                      <Coins className="w-3.5 h-3.5" aria-hidden="true" /> {item.price.toLocaleString()}
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
