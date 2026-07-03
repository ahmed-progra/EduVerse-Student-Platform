"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { XpBar } from "@/components/ui/xp-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import { api } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { fadeUp, staggerContainer, fastEaseTransition } from "@/lib/motion";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Coins,
  Check,
  Image,
  Frame,
  Sparkles,
  Type,
  Monitor,
  Wand2,
  WifiOff,
  Gift,
  AlertCircle,
} from "lucide-react";

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
  const [purchased, setPurchased] = useState<{ name: string; price: number } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const showActionError = (err: unknown, fallback: string) => {
    setActionError(err instanceof Error ? err.message : fallback);
    setTimeout(() => setActionError(null), 3500);
  };

  const loadData = async () => {
    try {
      const [itemsRes, invRes] = await Promise.all([api.getShopItems(), api.getInventory()]);
      setItems(itemsRes.data);
      setInventory(invRes.data);
      setOffline(false);
    } catch {
      setOffline(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const ownedIds = new Set(inventory.map((i) => i.itemId));
  const equippedIds = new Set(inventory.filter((i) => i.equipped).map((i) => i.itemId));

  const types = ["all", ...new Set(items.map((i) => i.type))];

  const filtered = activeTab === "all" ? items : items.filter((i) => i.type === activeTab);

  const handleBuy = async (itemId: string) => {
    setBuyingId(itemId);
    const item = items.find((it) => it.id === itemId);
    try {
      const res = await api.buyItem(itemId);
      api.clearCache();
      await loadData();
      updateCoins(res.data.coins);
      if (item) {
        setPurchased({ name: item.name, price: item.price });
        setTimeout(() => setPurchased(null), 2600);
      }
    } catch (err) {
      showActionError(err, "Purchase failed. Please try again.");
    }
    setBuyingId(null);
  };

  const handleEquip = async (itemId: string) => {
    try {
      await api.equipItem(itemId);
      api.clearCache();
      await loadData();
    } catch (err) {
      showActionError(err, "Couldn't equip that item. Please try again.");
    }
  };

  if (loading) {
    return (
      <motion.div
        className="space-y-8 max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="sk-card" style={{ height: "32px", width: "120px" }} />
        <div className="sk-card" style={{ height: "120px" }} />
        <SkeletonCardGrid count={8} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-8 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <AnimatePresence>
        {purchased && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeOut" } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="xp-toast"
            role="status"
          >
            <Coins className="w-6 h-6 text-eduverse-warning" aria-hidden="true" />
            <div>
              <div className="font-bold text-eduverse-text">Purchased {purchased.name}</div>
              <div className="text-xs text-eduverse-text-muted">
                −{purchased.price.toLocaleString()} coins
              </div>
            </div>
          </motion.div>
        )}
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeOut" } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="xp-toast"
            role="alert"
          >
            <AlertCircle className="w-6 h-6 text-eduverse-danger" aria-hidden="true" />
            <div>
              <div className="font-bold text-eduverse-text">Action failed</div>
              <div className="text-xs text-eduverse-text-muted">{actionError}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div variants={fadeUp} transition={fastEaseTransition}>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 font-display tracking-tight">
          <Gift className="w-6 h-6 text-eduverse-accent-light" />
          Shop
        </h1>
        <p className="text-eduverse-text-muted">Spend your coins on cosmetics and upgrades.</p>
      </motion.div>

      {/* Balance Card */}
      {user && (
        <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.05 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-mono text-eduverse-text-muted uppercase tracking-wider mb-1">
                  Your Balance
                </div>
                <div className="balance-card-amount">
                  <Coins className="w-6 h-6" aria-hidden="true" />
                  {user.coins.toLocaleString()}
                  <span className="text-base font-semibold text-eduverse-text-muted">coins</span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs text-eduverse-text-muted font-mono mb-1">Level</div>
                <div className="text-2xl font-bold font-mono text-eduverse-accent-light">
                  {user.level}
                </div>
              </div>
            </div>
            <XpBar xp={user.xp} />
          </GlassCard>
        </motion.div>
      )}

      {/* Type Filter */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.08 }}>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Filter
        </div>
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
      </motion.div>

      {/* Items Grid */}
      <motion.div variants={fadeUp} transition={{ ...fastEaseTransition, delay: 0.1 }}>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Shop Items
        </div>
      </motion.div>

      {offline ? (
        <motion.div variants={fadeUp} transition={fastEaseTransition}>
          <EmptyState
            icon={WifiOff}
            title="Can't reach the server"
            message="The EduVerse API isn't responding, so the shop can't be loaded."
          />
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} transition={fastEaseTransition}>
          <EmptyState
            icon={ShoppingBag}
            title="Nothing here yet"
            message="No items in this category. Check another tab or come back later."
          />
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => {
              const owned = ownedIds.has(item.id);
              const equipped = equippedIds.has(item.id);
              const Icon = TYPE_ICONS[item.type] || ShoppingBag;
              const levelOk = !!user && user.level >= item.levelRequired;
              const canAfford = !!user && user.coins >= item.price && levelOk;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                  transition={{
                    delay: Math.min(i * 0.04, 0.3),
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <GlassCard className={`text-center ${equipped ? "shop-equipped-ring" : ""}`}>
                    <div className="shop-item-icon">
                      <Icon className="w-8 h-8 text-eduverse-accent-light" />
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-eduverse-text tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-eduverse-text-muted mb-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div
                      className={`text-[11px] mb-3 font-mono ${
                        levelOk ? "text-eduverse-text-muted" : "text-eduverse-warning"
                      }`}
                    >
                      {levelOk ? (
                        <>Lv.{item.levelRequired} required</>
                      ) : (
                        <>
                          Requires Lv.{item.levelRequired} — you&apos;re Lv.{user?.level ?? 1}
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-eduverse-warning mb-4">
                      <Coins className="w-3.5 h-3.5" aria-hidden="true" />{" "}
                      {item.price.toLocaleString()}
                    </div>
                    {owned ? (
                      <GradientButton
                        onClick={() => handleEquip(item.id)}
                        variant={equipped ? "secondary" : "ghost"}
                        className="w-full text-xs py-2"
                      >
                        {equipped ? (
                          <>
                            <Check className="w-3 h-3" /> Equipped
                          </>
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
    </motion.div>
  );
}
