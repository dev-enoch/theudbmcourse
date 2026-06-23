"use client";

import { useState } from "react";
import { createPromoCode } from "../actions";

export default function PromoCodeManager({ codes }: { codes: any[] }) {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<number>(10);
  const [maxUses, setMaxUses] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || discount <= 0) return alert("Code and valid discount are required");

    setLoading(true);
    try {
      await createPromoCode({ code, discountPercentage: discount, maxUses });
      alert("Promo code created successfully!");
      setCode("");
      setDiscount(10);
      setMaxUses(0);
      // Let the page refresh or re-fetch in a real app (we'll assume a soft refresh later)
      window.location.reload();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Promotional Codes & Referrals</h2>
      <p className="text-gray-400 mb-6 text-sm">
        Generate discount codes for new signups or special campaigns.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">Code</label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 uppercase"
            placeholder="e.g. SUMMER20"
            required
          />
        </div>
        <div className="w-full md:w-32">
          <label className="block text-sm font-medium text-gray-300 mb-1">Discount %</label>
          <input
            type="number"
            value={discount}
            onChange={e => setDiscount(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            min={1}
            max={100}
            required
          />
        </div>
        <div className="w-full md:w-32">
          <label className="block text-sm font-medium text-gray-300 mb-1">Max Uses</label>
          <input
            type="number"
            value={maxUses}
            onChange={e => setMaxUses(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            min={0}
            title="0 means unlimited"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
          >
            {loading ? "Adding..." : "Add Code"}
          </button>
        </div>
      </form>

      {codes.length === 0 ? (
        <p className="text-gray-500">No promo codes active.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c._id} className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 text-white font-medium tracking-wider">{c.code}</td>
                  <td className="px-4 py-3 text-green-400">{c.discountPercentage}% Off</td>
                  <td className="px-4 py-3">
                    {c.currentUses} / {c.maxUses === 0 ? "∞" : c.maxUses}
                  </td>
                  <td className="px-4 py-3">
                    {c.isActive ? (
                      <span className="text-green-500">Active</span>
                    ) : (
                      <span className="text-red-500">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
