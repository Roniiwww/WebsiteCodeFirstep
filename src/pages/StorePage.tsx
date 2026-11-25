import React, { useState, useMemo, useEffect } from 'react';
import { GiftCardBrand, GiftCardRedemption } from '../types';
import { useAuth } from '../context/AuthContext';
import { CREDITS_PER_HOUR } from '../context/OpportunitiesContext';
import {
  Gift,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Lock,
  X,
  Clock,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StorePageProps {
  onNavigate: (page: string, params?: any) => void;
}

const REDEMPTIONS_KEY = 'giveback_redemptions_v1';
const CREDITS_PER_DOLLAR = 10;

const GIFT_CARD_BRANDS: GiftCardBrand[] = [
  {
    id: 'gc-amazon',
    brand: 'Amazon',
    category: 'Shopping',
    description: 'Redeem toward millions of books, electronics, essentials, and everyday items.',
    denominations: [5, 10, 25, 50],
    accentGradient: 'from-slate-900 via-slate-800 to-amber-700',
    tagText: 'Most Popular',
    codePrefix: 'AMZN'
  },
  {
    id: 'gc-starbucks',
    brand: 'Starbucks',
    category: 'Food & Coffee',
    description: 'Enjoy handcrafted coffee, tea, and bakery treats at participating cafés.',
    denominations: [5, 10, 25, 50],
    accentGradient: 'from-emerald-900 via-emerald-800 to-emerald-600',
    tagText: 'Quick Treat',
    codePrefix: 'SBUX'
  },
  {
    id: 'gc-apple',
    brand: 'Apple',
    category: 'Shopping',
    description: 'Use for apps, games, music, iCloud storage, movies, and Apple accessories.',
    denominations: [10, 25, 50, 100],
    accentGradient: 'from-slate-800 via-slate-900 to-indigo-950',
    tagText: 'Digital & Store',
    codePrefix: 'APPL'
  },
  {
    id: 'gc-target',
    brand: 'Target',
    category: 'Shopping',
    description: 'Shop home goods, apparel, groceries, and school supplies online or in-store.',
    denominations: [5, 10, 25, 50],
    accentGradient: 'from-rose-700 via-red-600 to-rose-800',
    tagText: 'Everyday Value',
    codePrefix: 'TRGT'
  },
  {
    id: 'gc-ubereats',
    brand: 'Uber Eats',
    category: 'Food & Coffee',
    description: 'Order meals and local favorites delivered straight to your doorstep.',
    denominations: [10, 20, 35, 50],
    accentGradient: 'from-emerald-950 via-slate-900 to-emerald-700',
    tagText: 'Food Delivery',
    codePrefix: 'UBER'
  },
  {
    id: 'gc-spotify',
    brand: 'Spotify',
    category: 'Entertainment',
    description: 'Unlock ad-free music streaming, offline playlists, and audiobooks.',
    denominations: [10, 20, 30, 60],
    accentGradient: 'from-emerald-700 via-green-700 to-slate-900',
    tagText: 'Music & Audio',
    codePrefix: 'SPOT'
  },
  {
    id: 'gc-steam',
    brand: 'Steam',
    category: 'Gaming',
    description: 'Add funds to your Steam Wallet for PC games, DLC, and community items.',
    denominations: [5, 10, 20, 50],
    accentGradient: 'from-slate-900 via-blue-900 to-sky-800',
    tagText: 'PC Gaming',
    codePrefix: 'STEM'
  },
  {
    id: 'gc-playstation',
    brand: 'PlayStation Store',
    category: 'Gaming',
    description: 'Purchase digital games, add-ons, and subscriptions on PlayStation consoles.',
    denominations: [10, 25, 50, 75],
    accentGradient: 'from-blue-800 via-indigo-800 to-slate-950',
    tagText: 'Console Gaming',
    codePrefix: 'PSN'
  },
  {
    id: 'gc-wholefoods',
    brand: 'Whole Foods Market',
    category: 'Food & Coffee',
    description: 'Fresh organic produce, pantry staples, and prepared meals.',
    denominations: [10, 25, 50, 100],
    accentGradient: 'from-teal-800 via-emerald-800 to-teal-950',
    tagText: 'Fresh Groceries',
    codePrefix: 'WFM'
  },
  {
    id: 'gc-visa',
    brand: 'Visa Prepaid',
    category: 'Prepaid',
    description: 'Flexible digital prepaid reward accepted anywhere online Visa cards work.',
    denominations: [10, 25, 50, 100],
    accentGradient: 'from-blue-700 via-blue-800 to-slate-900',
    tagText: 'Flexible Choice',
    codePrefix: 'VISA'
  }
];

function generateClaimCode(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `GB-${prefix}-${segment()}-${segment()}`;
}

export const StorePage: React.FC<StorePageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, openAuthModal, spendCredits } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [affordableOnly, setAffordableOnly] = useState<boolean>(false);
  const [selectedAmounts, setSelectedAmounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    GIFT_CARD_BRANDS.forEach((b) => {
      initial[b.id] = b.denominations[0];
    });
    return initial;
  });

  const [redemptions, setRedemptions] = useState<GiftCardRedemption[]>(() => {
    try {
      const saved = localStorage.getItem(REDEMPTIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [confirmSelection, setConfirmSelection] = useState<{
    brand: GiftCardBrand;
    valueUsd: number;
    creditCost: number;
  } | null>(null);
  const [redeemError, setRedeemError] = useState<string>('');
  const [justRedeemed, setJustRedeemed] = useState<GiftCardRedemption | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(redemptions));
  }, [redemptions]);

  const userCredits = user?.credits ?? 0;

  const categories = ['All', 'Shopping', 'Food & Coffee', 'Entertainment', 'Gaming', 'Prepaid'];

  const filteredBrands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return GIFT_CARD_BRANDS.filter((b) => {
      if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;
      if (q && !b.brand.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q)) {
        return false;
      }
      if (affordableOnly) {
        const chosenUsd = selectedAmounts[b.id] ?? b.denominations[0];
        if (userCredits < chosenUsd * CREDITS_PER_DOLLAR) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery, affordableOnly, selectedAmounts, userCredits]);

  const myRedemptions = useMemo(() => {
    if (!user) return [];
    return redemptions.filter((r) => r.userId === user.id);
  }, [redemptions, user]);

  const handleConfirmRedeem = () => {
    if (!confirmSelection) return;
    if (!isAuthenticated || !user) {
      openAuthModal('signin');
      return;
    }

    setRedeemError('');
    try {
      spendCredits(confirmSelection.creditCost);

      const newRedemption: GiftCardRedemption = {
        id: `red-${Date.now()}`,
        userId: user.id,
        giftCardId: confirmSelection.brand.id,
        brand: confirmSelection.brand.brand,
        valueUsd: confirmSelection.valueUsd,
        creditCost: confirmSelection.creditCost,
        claimCode: generateClaimCode(confirmSelection.brand.codePrefix),
        redeemedAt: new Date().toISOString()
      };

      setRedemptions((prev) => [newRedemption, ...prev]);
      setConfirmSelection(null);
      setJustRedeemed(newRedemption);

      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setRedeemError(err?.message || 'Could not complete redemption.');
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <a href="#/home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-blue-600 transition">
            Home
          </a>
          <span>/</span>
          <span className="text-blue-700 font-bold">Gift Card Store</span>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-3 py-1 rounded-full">
              <Gift className="w-3.5 h-3.5" />
              GiveBack™ Volunteer Rewards Store
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Redeem Credits for Your Gift Card of Choice
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Reach an organizer’s target volunteer hours on any accepted project to unlock credits at{' '}
              <strong className="text-white">1 hour = {CREDITS_PER_HOUR} credits</strong>, then exchange them for any brand and amount below.
            </p>
          </div>

          {/* Wallet Card */}
          <div className="w-full lg:w-auto lg:min-w-[270px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 space-y-3">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Your Credit Balance</span>
                  <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {user.hoursLogged ?? 0} hrs logged
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-white flex items-baseline gap-2">
                  <span>{userCredits}</span>
                  <span className="text-sm font-semibold text-emerald-300">Credits</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="flex-1 py-2 px-3 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition"
                  >
                    My Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('explore')}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition"
                  >
                    Earn More
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-center">
                <Lock className="w-6 h-6 text-amber-300 mx-auto" />
                <div className="text-xs text-slate-200">
                  Sign in to view your earned credits and redeem gift cards.
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="w-full py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                >
                  Sign In to Redeem
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAuthenticated && (
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={affordableOnly}
                onChange={(e) => setAffordableOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Affordable now</span>
            </label>
          )}

          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>
      </div>

      {/* Gift Cards Catalog */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((card) => {
            const chosenUsd = selectedAmounts[card.id] ?? card.denominations[0];
            const creditCost = chosenUsd * CREDITS_PER_DOLLAR;
            const canAfford = isAuthenticated && userCredits >= creditCost;
            const creditsNeeded = Math.max(0, creditCost - userCredits);
            const hoursEquivalent = Math.round((creditsNeeded / CREDITS_PER_HOUR) * 10) / 10;

            return (
              <div
                key={card.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  {/* Visual Gift Card Header */}
                  <div className={`p-5 bg-gradient-to-br ${card.accentGradient} text-white relative`}>
                    <div className="flex items-center justify-between text-[11px] font-bold opacity-90">
                      <span className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-xs">
                        {card.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20">
                        {card.tagText}
                      </span>
                    </div>

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <div className="text-xl font-extrabold tracking-tight">{card.brand}</div>
                        <div className="text-[11px] text-white/80">Digital Gift Card</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold">${chosenUsd}</div>
                        <div className="text-[11px] font-bold text-emerald-300">
                          {creditCost} credits
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                      {card.description}
                    </p>

                    {/* Value Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Select Amount
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {card.denominations.map((val) => {
                          const isSelected = chosenUsd === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                setSelectedAmounts((prev) => ({ ...prev, [card.id]: val }))
                              }
                              className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              ${val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 pb-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      Cost: <strong className="text-slate-900">{creditCost} credits</strong>
                    </span>
                    {isAuthenticated && (
                      <span
                        className={`text-[11px] font-bold ${
                          canAfford ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {canAfford
                          ? 'Ready to redeem'
                          : `Need ${creditsNeeded} more (${hoursEquivalent} hrs)`}
                      </span>
                    )}
                  </div>

                  {!isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => openAuthModal('signin')}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In to Redeem</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        setRedeemError('');
                        setConfirmSelection({
                          brand: card,
                          valueUsd: chosenUsd,
                          creditCost
                        });
                      }}
                      className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>
                        {canAfford ? `Redeem $${chosenUsd} ${card.brand}` : `Earn ${creditsNeeded} more credits`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
          <Gift className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching gift cards</h3>
          <p className="text-xs text-slate-500">
            Try clearing your search or turning off the affordable-only filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setAffordableOnly(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Show All Gift Cards
          </button>
        </div>
      )}

      {/* My Redeemed Gift Cards Vault */}
      {isAuthenticated && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>My Redeemed Gift Cards ({myRedemptions.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Your digital gift card codes unlocked from volunteer credits
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Volunteer for more credits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myRedemptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRedemptions.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        ${item.valueUsd} {item.brand}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        -{item.creditCost} credits
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                      {item.claimCode}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Redeemed on {new Date(item.redeemedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(item.id, item.claimCode)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shrink-0 inline-flex items-center gap-1.5 transition"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              You haven’t redeemed any gift cards yet. Reach an organizer’s target hours on an opportunity to start earning credits!
            </p>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmSelection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Confirm Gift Card Redemption</h3>
              <button
                type="button"
                onClick={() => setConfirmSelection(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-5 rounded-2xl bg-gradient-to-br ${confirmSelection.brand.accentGradient} text-white flex items-center justify-between`}>
              <div>
                <div className="text-xs opacity-80">{confirmSelection.brand.category}</div>
                <div className="text-xl font-extrabold">{confirmSelection.brand.brand}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold">${confirmSelection.valueUsd}</div>
                <div className="text-xs font-bold text-emerald-300">
                  {confirmSelection.creditCost} credits
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Current Balance</span>
                <strong className="text-slate-900">{userCredits} credits</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Redemption Cost</span>
                <strong className="text-rose-600">-{confirmSelection.creditCost} credits</strong>
              </div>
              <div className="flex justify-between text-slate-900 pt-1.5 border-t border-slate-200 font-bold">
                <span>Remaining Balance</span>
                <span>{userCredits - confirmSelection.creditCost} credits</span>
              </div>
            </div>

            {redeemError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {redeemError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmSelection(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRedeem}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm & Get Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redemption Success Modal */}
      {justRedeemed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 text-center space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">
                ${justRedeemed.valueUsd} {justRedeemed.brand} Card Unlocked!
              </h3>
              <p className="text-xs text-slate-500">
                Thank you for your volunteer service. Your reward code is saved below:
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-emerald-400 font-mono text-base font-extrabold text-emerald-700 tracking-wider">
              {justRedeemed.claimCode}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleCopyCode(justRedeemed.id, justRedeemed.claimCode)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
              >
                {copiedId === justRedeemed.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setJustRedeemed(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
