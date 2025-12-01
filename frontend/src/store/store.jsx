import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrency,
  addCurrency,
  getOwned,
  buyStoreItem,
  openLootbox,
} from "/src/lib/apiClient";
import NavBar from "/src/components/navbar/navbar.jsx";

const ICONS = [
  { id: 0, name: "Icon 1", price: 100 },
  { id: 1, name: "Icon 2", price: 150 },
];

const COLORS = [
  { id: 0, name: "Color 1", price: 80 },
  { id: 1, name: "Color 2", price: 120 },
];

function parseOwned(raw, count) {
  if (!raw) return Array(count).fill(false);

  if (Array.isArray(raw)) {
    return raw.slice(0, count).map((x) => !!x);
  }

  if (typeof raw === "string") {
    return raw
      .split("")
      .slice(0, count)
      .map((ch) => ch === "1");
  }

  return Array(count).fill(false);
}

export default function Store() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [ownedIcons, setOwnedIcons] = useState(Array(ICONS.length).fill(false));
  const [ownedColors, setOwnedColors] = useState(
    Array(COLORS.length).fill(false),
  );
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      try {
        const [currencyRes, ownedRes] = await Promise.all([
          getCurrency(),
          getOwned(),
        ]);

        if (currencyRes?.success && currencyRes?.data) {
          const data = currencyRes.data;
          const bal =
            data.balance ??
            data.Balance ??
            data.currentBalance ??
            data.currency ??
            0;
          setBalance(bal);
        }

        if (ownedRes?.success && ownedRes?.data) {
          setOwnedIcons(parseOwned(ownedRes.data.items, ICONS.length));
          setOwnedColors(parseOwned(ownedRes.data.colors, COLORS.length));
        }
      } catch (e) {
        setError("Failed to load store data");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  function clearMessages() {
    setMsg("");
    setError("");
  }

  async function handleAddCurrency(e) {
    e.preventDefault();
    clearMessages();

    const value = parseInt(amount, 10);
    if (isNaN(value) || value <= 0) {
      setError("Enter a positive amount");
      return;
    }

    try {
      const res = await addCurrency(value);
      if (res?.success && res?.data) {
        const newBalance =
          res.data.balance ??
          res.data.Balance ??
          res.data.currentBalance ??
          0;
        setBalance(newBalance);
        setMsg("Currency added");
        setAmount("");
      } else {
        setError(res?.error || "Could not add currency");
      }
    } catch {
      setError("Could not reach server");
    }
  }

  async function handleBuy(kind, index) {
    clearMessages();

    if (kind === "icon" && ownedIcons[index]) {
      setError("You already own this icon");
      return;
    }
    if (kind === "color" && ownedColors[index]) {
      setError("You already own this color");
      return;
    }

    try {
      // terrible quick fix for icon purchase not working
      //  (you need to pass it as kind="item", not "icon")
      //  ( I think someone changed the name of these from item to icon )
      if (kind === "icon"){
        kind = "item"
      }
      const res = await buyStoreItem(kind, index);
      if (!res?.success) {
        setError(res?.error || "Purchase failed");
        return;
      }

      const data = res.data || {};

      const newBalance =
        data.balance ?? data.Balance ?? data.currentBalance ?? balance;
      setBalance(newBalance);

      if (data.items) {
        setOwnedIcons(parseOwned(data.items, ICONS.length));
      }
      if (data.colors) {
        setOwnedColors(parseOwned(data.colors, COLORS.length));
      }

      setMsg("Purchase complete");
    } catch {
      setError("Could not reach server");
    }
  }

  async function handleLootbox() {
    clearMessages();

    try {
      const res = await openLootbox();
      if (!res?.success) {
        setError(res?.error || "Loot box failed");
        return;
      }

      const data = res.data || {};

      const newBalance =
        data.balance ?? data.Balance ?? data.currentBalance ?? balance;
      setBalance(newBalance);

      if (data.items) {
        setOwnedIcons(parseOwned(data.items, ICONS.length));
      }
      if (data.colors) {
        setOwnedColors(parseOwned(data.colors, COLORS.length));
      }

      if (typeof data.index === "number" && data.kind) {
        setMsg(`You received ${data.kind} #${data.index + 1}`);
      } else {
        setMsg("Loot box opened");
      }
    } catch {
      setError("Could not reach server");
    }
  }

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center text-white">
          Loading store...
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex flex-col items-center pt-24 text-white">
        <h1 className="text-3xl mb-2">Store</h1>
        <p className="mb-6">Balance: ${balance}</p>

        {/* Currency section */}
        <form
          onSubmit={handleAddCurrency}
          className="mb-10 flex flex-col items-center space-y-3"
        >
          <span className="text-lg">Add Credits</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="px-3 py-2 rounded bg-black/40 border border-cyan-400 outline-none"
            placeholder="Amount"
          />
          <button type="submit" className="btn-cyan-glow">
            Add to Balance
          </button>
        </form>

        {/* Icons */}
        <section className="mb-8 w-full max-w-3xl px-4">
          <h2 className="text-xl mb-4">Icons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ICONS.map((icon, idx) => (
              <div
                key={icon.id}
                className="border border-cyan-400/60 rounded-xl p-4 flex flex-col items-center bg-black/30"
              >
                <span className="mb-1">{icon.name}</span>
                <span className="mb-3">${icon.price}</span>
                {ownedIcons[idx] ? (
                  <span className="text-green-400 text-sm">Owned</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBuy("icon", icon.id)}
                    className="btn-cyan-glow"
                  >
                    Buy
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Colors */}
        <section className="mb-10 w-full max-w-3xl px-4">
          <h2 className="text-xl mb-4">Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COLORS.map((color, idx) => (
              <div
                key={color.id}
                className="border border-pink-400/60 rounded-xl p-4 flex flex-col items-center bg-black/30"
              >
                <span className="mb-1">{color.name}</span>
                <span className="mb-3">${color.price}</span>
                {ownedColors[idx] ? (
                  <span className="text-green-400 text-sm">Owned</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBuy("color", color.id)}
                    className="btn-pink-glow"
                  >
                    Buy
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Loot box */}
        <section className="mb-6">
          <h2 className="text-xl mb-3">Loot box</h2>
          <button
            type="button"
            onClick={handleLootbox}
            className="btn-cyan-glow"
          >
            Open loot box ($50)
          </button>
        </section>

        {error && <p className="text-red-400 mt-2">{error}</p>}
        {msg && <p className="text-green-400 mt-2">{msg}</p>}

        <button
          onClick={() => navigate("/home")}
          className="btn-cyan-glow mt-6 mb-10"
        >
          Return to Home
        </button>
      </div>
    </>
  );
}
