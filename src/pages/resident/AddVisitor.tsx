import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useCreateVisitor } from "@/hooks/useVisitors";

const schema = z.object({
  visitor_name: z.string().min(1, "Required"),
  visitor_phone: z.string().optional(),
  vehicle_registration: z.string().optional(),
  visitor_category: z.enum(["guest", "delivery", "contractor"]),
  expected_at: z.string().min(1, "Required"),
  expires_at: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

export default function AddVisitor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createVisitor = useCreateVisitor();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { visitor_category: "guest" },
  });

  async function onSubmit(values: FormValues) {
    const { data: ru } = await (supabase.from("resident_units") as any)
      .select("unit_id")
      .eq("resident_id", user!.id)
      .single();
    await createVisitor.mutateAsync({
      ...values,
      resident_id: user!.id,
      unit_id: ru?.unit_id,
    });
    navigate("/visitors");
  }

  return (
    <div className="card p-6 max-w-2xl">
      <h1 className="text-2xl mb-1">Register a Visitor</h1>
      <p className="text-slate mb-5">Pre-authorise a visitor before they arrive.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate mb-1">Visitor name</label>
          <input {...register("visitor_name")} className="w-full border border-line rounded-lg p-3 bg-white" />
          {errors.visitor_name && <p className="text-signal text-xs mt-1">{errors.visitor_name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-slate mb-1">Visitor phone</label>
          <input {...register("visitor_phone")} className="w-full border border-line rounded-lg p-3 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate mb-1">Vehicle registration</label>
          <input {...register("vehicle_registration")} className="w-full border border-line rounded-lg p-3 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate mb-1">Category</label>
          <select {...register("visitor_category")} className="w-full border border-line rounded-lg p-3 bg-white">
            <option value="guest">Guest</option>
            <option value="delivery">Delivery</option>
            <option value="contractor">Contractor</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate mb-1">Expected at</label>
          <input type="datetime-local" {...register("expected_at")} className="w-full border border-line rounded-lg p-3 bg-white" />
          {errors.expected_at && <p className="text-signal text-xs mt-1">{errors.expected_at.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-slate mb-1">Expires at</label>
          <input type="datetime-local" {...register("expires_at")} className="w-full border border-line rounded-lg p-3 bg-white" />
          {errors.expires_at && <p className="text-signal text-xs mt-1">{errors.expires_at.message}</p>}
        </div>
        <button disabled={isSubmitting} className="btn-primary">{isSubmitting ? "Saving…" : "Register visitor"}</button>
      </form>
    </div>
  );
}