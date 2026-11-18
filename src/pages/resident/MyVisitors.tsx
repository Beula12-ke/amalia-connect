import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useVisitors } from "@/hooks/useVisitors";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MyVisitors() {
  const { data: visitors, isLoading } = useVisitors();

  if (isLoading) {
    return (
      <div className="card p-6">
        <h1 className="text-2xl mb-4">My Visitors</h1>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h1 className="text-2xl mb-4">My Visitors</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate border-b border-line">
              <th className="py-2">Visitor</th>
              <th className="py-2">Unit</th>
              <th className="py-2">Expected</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(visitors ?? []).map((v: any) => (
              <tr key={v.id} className="border-b border-line">
                <td className="py-2 font-medium">{v.visitor_name}</td>
                <td className="py-2">{v.units?.unit_code ?? "—"}</td>
                <td className="py-2">{v.expected_at ? format(new Date(v.expected_at), "PP p") : "—"}</td>
                <td className="py-2">
                  <span className={v.status === "approved" ? "badge-success" : "badge-neutral"}>{v.status}</span>
                </td>
                <td className="py-2">
                  <Link to={`/visitors/${v.id}/pass`} className="btn-secondary text-xs">View Pass</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}