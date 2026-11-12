import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function Announcements() {
  const { data, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <div className="text-slate">Loading…</div>;
  return (
    <div>
      <h1 className="text-2xl mb-4">Announcements</h1>
      <div className="space-y-4">
        {(data ?? []).map((a: any) => (
          <div key={a.id} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg">{a.title}</h2>
              <span className={a.priority === "high" ? "badge-warning" : "badge-neutral"}>{a.priority}</span>
            </div>
            <p className="text-slate text-sm whitespace-pre-line">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}