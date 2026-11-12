import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function ServiceDesk() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["all_service_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*, profiles(full_name), units(unit_code)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from("service_requests") as any).update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all_service_requests"] }),
  });

  return (
    <div>
      <h1 className="text-2xl mb-4">Service Desk</h1>
      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate border-b border-line">
              <th className="py-2">Resident</th>
              <th className="py-2">Unit</th>
              <th className="py-2">Title</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r: any) => (
              <tr key={r.id} className="border-b border-line">
                <td className="py-2">{r.profiles?.full_name ?? "—"}</td>
                <td className="py-2">{r.units?.unit_code ?? "—"}</td>
                <td className="py-2">{r.title}</td>
                <td className="py-2">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus.mutate({ id: r.id, status: e.target.value })}
                    className="border border-line rounded-lg p-1 bg-white"
                  >
                    <option value="submitted">submitted</option>
                    <option value="in_progress">in_progress</option>
                    <option value="resolved">resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}