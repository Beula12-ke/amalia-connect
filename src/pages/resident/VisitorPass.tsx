import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";

export default function VisitorPass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: visitor, isLoading } = useQuery({
    queryKey: ["visitor", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("visitors").select("*, units(unit_code)").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const revoke = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from("visitors") as any).update({ status: "cancelled" }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor", id] });
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      navigate("/visitors");
    },
  });

  if (isLoading) return <div className="text-slate">Loading…</div>;
  if (!visitor) return <div className="card p-6"><p className="text-signal">Visitor not found.</p></div>;

  return (
    <div className="card p-6 max-w-md mx-auto text-center">
      <h1 className="text-2xl mb-1">{(visitor as any).visitor_name}</h1>
      <p className="text-slate mb-4">{(visitor as any).units?.unit_code ?? "—"}</p>
      <div className="grid place-items-center bg-white p-4 rounded-lg border border-line">
        <QRCodeSVG value={(visitor as any).pass_code} size={200} />
      </div>
      <p className="mt-4 text-lg font-mono tracking-widest">{(visitor as any).pass_code}</p>
      <p className="text-slate text-xs mt-1">Show this code at the gate</p>
      <button onClick={() => revoke.mutate()} disabled={revoke.isPending} className="btn-secondary mt-6 text-signal">
        {revoke.isPending ? "Revoking…" : "Revoke pass"}
      </button>
    </div>
  );
}
