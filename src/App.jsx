import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  registerables,
} from "chart.js";

ChartJS.register(...registerables);

const INCOME_CATEGORIES = ["Salary", "Business", "Freelance", "Gift", "Other income"];
const EXPENSE_CATEGORIES = [
  "Rent",
  "Food",
  "Transport",
  "Airtime & Data",
  "Chama contribution",
  "Utilities",
  "Health",
  "Entertainment",
  "Other expense",
];

const CATEGORY_COLORS = {
  Rent: "#378ADD",
  Food: "#1D9E75",
  Transport: "#EF9F27",
  "Airtime & Data": "#7F77DD",
  "Chama contribution": "#D85A30",
  Utilities: "#D4537E",
  Health: "#E24B4A",
  Entertainment: "#888780",
  "Other expense": "#5F5E5A",
};

const uid = () => Math.random().toString(36).slice(2, 10);

const todayStr = () => new Date().toISOString().slice(0, 10);

const formatKES = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);

const seedData = [
  { id: uid(), type: "income", amount: 65000, category: "Salary", description: "July salary", date: "2026-07-01" },
  { id: uid(), type: "expense", amount: 18000, category: "Rent", description: "House rent", date: "2026-07-02" },
  { id: uid(), type: "expense", amount: 6500, category: "Food", description: "Groceries - Naivas", date: "2026-07-03" },
  { id: uid(), type: "income", amount: 12000, category: "Freelance", description: "Logo design gig", date: "2026-07-04" },
  { id: uid(), type: "expense", amount: 3000, category: "Transport", description: "Matatu fare + fuel", date: "2026-07-05" },
  { id: uid(), type: "expense", amount: 5000, category: "Chama contribution", description: "Monthly chama merry-go-round", date: "2026-07-06" },
  { id: uid(), type: "expense", amount: 1500, category: "Airtime & Data", description: "Safaricom bundles", date: "2026-07-07" },
  { id: uid(), type: "expense", amount: 2200, category: "Entertainment", description: "Movie night", date: "2026-07-08" },
];

function PieChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = Object.keys(data);
    const values = Object.values(data);

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((l) => CATEGORY_COLORS[l] || "#B4B2A9"),
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: { legend: { display: false } },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [JSON.stringify(data)]);

  return (
    <div style={{ position: "relative", width: "100%", height: "260px" }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Doughnut chart showing expense breakdown by category"
      >
        Expense breakdown by category
      </canvas>
    </div>
  );
}

function TrendChart({ labels, income, expense }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Income",
            data: income,
            backgroundColor: "#1D9E75",
            borderRadius: 4,
            maxBarThickness: 24,
          },
          {
            label: "Expense",
            data: expense,
            backgroundColor: "#E24B4A",
            borderRadius: 4,
            maxBarThickness: 24,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => (v >= 1000 ? `${v / 1000}k` : v),
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [JSON.stringify(labels), JSON.stringify(income), JSON.stringify(expense)]);

  return (
    <div style={{ position: "relative", width: "100%", height: "260px" }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Bar chart comparing daily income and expense"
      >
        Daily income vs expense
      </canvas>
    </div>
  );
}

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState(seedData);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: EXPENSE_CATEGORIES[0],
    description: "",
    date: todayStr(),
  });

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions]);

  const trendData = useMemo(() => {
    const byDate = {};
    transactions.forEach((t) => {
      if (!byDate[t.date]) byDate[t.date] = { income: 0, expense: 0 };
      byDate[t.date][t.type] += t.amount;
    });
    const dates = Object.keys(byDate).sort();
    return {
      labels: dates.map((d) => d.slice(5)),
      income: dates.map((d) => byDate[d].income),
      expense: dates.map((d) => byDate[d].expense),
    };
  }, [transactions]);

  const allCategories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category));
    return ["all", ...Array.from(set)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => (filterType === "all" ? true : t.type === filterType))
      .filter((t) => (filterCategory === "all" ? true : t.category === filterCategory))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, filterType, filterCategory]);

  const handleTypeChange = (type) => {
    setForm((f) => ({
      ...f,
      type,
      category: type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  const handleSubmit = () => {
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return;
    setTransactions((prev) => [
      ...prev,
      {
        id: uid(),
        type: form.type,
        amount: amt,
        category: form.category,
        description: form.description.trim() || "No description",
        date: form.date,
      },
    ]);
    setForm((f) => ({ ...f, amount: "", description: "" }));
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const categoryOptions = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">Expense tracker</h1>
          <p className="text-sm text-stone-500 mt-1">
            Track income and spending, and see where your money goes.
          </p>
        </header>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">Balance</p>
            <p
              className={`text-2xl font-semibold ${totals.balance >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
            >
              {formatKES(totals.balance)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">Total income</p>
            <p className="text-2xl font-semibold text-emerald-700">{formatKES(totals.income)}</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">Total expense</p>
            <p className="text-2xl font-semibold text-red-700">{formatKES(totals.expense)}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="text-sm font-medium text-stone-700 mb-3">Spending by category</h2>
            {Object.keys(expenseByCategory).length === 0 ? (
              <p className="text-sm text-stone-400 py-16 text-center">No expenses yet.</p>
            ) : (
              <>
                <PieChart data={expenseByCategory} />
                <div className="flex flex-wrap gap-3 mt-4 text-xs text-stone-600">
                  {Object.entries(expenseByCategory).map(([cat, amt]) => (
                    <span key={cat} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-sm inline-block"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] || "#B4B2A9" }}
                      />
                      {cat} · {formatKES(amt)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="text-sm font-medium text-stone-700 mb-3">Income vs expense by day</h2>
            {trendData.labels.length === 0 ? (
              <p className="text-sm text-stone-400 py-16 text-center">No transactions yet.</p>
            ) : (
              <>
                <TrendChart {...trendData} />
                <div className="flex gap-4 mt-3 text-xs text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block bg-emerald-600" />
                    Income
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block bg-red-500" />
                    Expense
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add transaction form */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 h-fit">
            <h2 className="text-sm font-medium text-stone-700 mb-4">Add transaction</h2>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleTypeChange("expense")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${form.type === "expense"
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "bg-white border-stone-200 text-stone-500"
                  }`}
              >
                Expense
              </button>
              <button
                onClick={() => handleTypeChange("income")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${form.type === "income"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-white border-stone-200 text-stone-500"
                  }`}
              >
                Income
              </button>
            </div>

            <label className="block text-xs text-stone-500 mb-1">Amount (KES)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />

            <label className="block text-xs text-stone-500 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-stone-300"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="block text-xs text-stone-500 mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Uber to town"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />

            <label className="block text-xs text-stone-500 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-stone-300"
            />

            <button
              onClick={handleSubmit}
              className="w-full bg-stone-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-stone-800 transition"
            >
              Add transaction
            </button>
          </div>

          {/* Transaction list */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-medium text-stone-700">Transactions</h2>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                >
                  <option value="all">All types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All categories" : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="divide-y divide-stone-100 max-h-[420px] overflow-y-auto">
              {filteredTransactions.length === 0 && (
                <p className="text-sm text-stone-400 py-10 text-center">
                  No transactions match this filter.
                </p>
              )}
              {filteredTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {t.description}
                    </p>
                    <p className="text-xs text-stone-400">
                      {t.category} · {t.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-sm font-medium ${t.type === "income" ? "text-emerald-700" : "text-red-700"
                        }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatKES(t.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-stone-400 hover:text-red-600 text-xs"
                      aria-label={`Delete ${t.description}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
