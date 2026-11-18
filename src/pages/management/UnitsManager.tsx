import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Building2, Plus, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/lib/database.types";

type Unit = Database["public"]["Tables"]["units"]["Row"];
type UnitInsert = Database["public"]["Tables"]["units"]["Insert"];

export default function UnitsManager() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [unitCode, setUnitCode] = useState("");
  const [blockName, setBlockName] = useState("");
  const [unitType, setUnitType] = useState("Villa");

  // Fetch Units
  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ["admin-units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("units").select("*").order("unit_code", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Add Unit Mutation
  const addUnit = useMutation({
    mutationFn: async (newUnit: UnitInsert) => {
      const { error } = await (supabase as any).from("units").insert([newUnit]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-units"] });
      setIsAdding(false);
      setUnitCode("");
      setBlockName("");
    },
  });

  // Delete Unit Mutation
  const deleteUnit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("units").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-units"] });
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">Units & Blocks</h1>
          <p className="text-slate mt-1">Manage the estate inventory and available housing.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary flex items-center gap-2"
        >
          {isAdding ? "Cancel" : <><Plus size={18} /> Add New Unit</>}
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-premium border border-line">
          <h2 className="font-bold text-navy mb-4">Create New Unit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate mb-1">Unit Code (e.g., A-001)</label>
              <input type="text" value={unitCode} onChange={(e) => setUnitCode(e.target.value)} className="w-full border border-line rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate mb-1">Block Name (e.g., Block A)</label>
              <input type="text" value={blockName} onChange={(e) => setBlockName(e.target.value)} className="w-full border border-line rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate mb-1">Type</label>
              <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className="w-full border border-line rounded-lg p-3 bg-white">
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Townhouse">Townhouse</option>
              </select>
            </div>
          </div>
          <button onClick={() => addUnit.mutate({ unit_code: unitCode.toUpperCase(), block_name: blockName, unit_type: unitType, occupancy_status: "vacant" })} disabled={addUnit.isPending || !unitCode} className="btn-primary flex items-center gap-2">
            {addUnit.isPending && <Loader2 size={16} className="animate-spin" />} Save Unit
          </button>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl shadow-premium border border-line overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate">Loading units...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-ivory border-b border-line">
              <tr>
                <th className="p-4 text-xs font-bold text-slate uppercase">Unit Code</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Block</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Type</th>
                <th className="p-4 text-xs font-bold text-slate uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-slate uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {units?.map((unit) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={unit.id} className="border-b border-line last:border-0 hover:bg-ivory/50 transition-colors">
                  <td className="p-4 font-bold text-navy">{unit.unit_code}</td>
                  <td className="p-4 text-slate">{unit.block_name || "—"}</td>
                  <td className="p-4 text-slate">{unit.unit_type}</td>
                  <td className="p-4">
                    <span className={`badge ${unit.occupancy_status === 'occupied' ? 'badge-success' : unit.occupancy_status === 'maintenance' ? 'badge-warning' : 'badge-neutral'}`}>
                      {unit.occupancy_status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => { if(confirm("Delete this unit?")) deleteUnit.mutate(unit.id); }} className="text-signal hover:bg-signal/10 p-2 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}