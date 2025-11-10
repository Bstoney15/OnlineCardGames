import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrency, addCurrency } from "/src/lib/apiClient";

export default function Store() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // load current balance on mount
    const fetchBalance = async () => {
      try {
        const res = await getCurrency();
        if (res.success) {
          setBalance(res.data.balance);
        } else {
          setError("Could not load balance");
        }
      } catch {
        setError("Could not load balance");
      }
    };

    fetchBalance();
  }, []);

  const handleAdd = async () => {
    setError("");
    setMsg("");

    const num = Number(amount);
    if (Number.isNaN(num) || num <= 0) {
      setError("Enter a valid amount");
      return;
    }

    try {
      const res = await addCurrency(num);
      if (res.success) {
        setBalance(res.data.balance);
        setMsg("Balance updated!");
        setAmount("");
      } else {
        setError("Could not add currency");
      }
    } catch {
      setError("Could not add currency");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Currency Store</h1>
      <p className="text-lg">
        Current Balance: <span className="font-mono">{balance}</span>
      </p>

      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder="Amount"
        />
        <button onClick={handleAdd} className="btn-cyan-glow">
          Add Currency
        </button>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {msg && <p className="text-green-400">{msg}</p>}

      {/* Return Button */}
      <button
        onClick={() => navigate("/home")}
        className="btn-cyan-glow mt-4"
      >
        Return to Home
      </button>
    </div>
  );
}
