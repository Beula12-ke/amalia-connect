import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook that subscribes to real-time inserts on the `notifications` and
 * `emergency_alerts` tables and fires a native browser notification when a
 * new row arrives. Safe to call globally — it does nothing if the browser
 * does not support the Notification API.
 */
export function usePushNotifications() {
  useEffect(() => {
    if (typeof Notification === "undefined") return;

    function fireNotification(title: string, body: string) {
      try {
        if (Notification.permission !== "granted") return;
        const n = new Notification(title, { body, icon: "/logo.png" });
        n.onclick = () => {
          window.focus();
          n.close();
        };
      } catch {
        // Ignore failures (e.g. blocked origin, missing icon).
      }
    }

    const channel = supabase
      .channel("push-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: any) => {
          const row = payload.new;
          if (!row) return;
          fireNotification(row.title ?? "New Notification", row.message ?? "");
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "emergency_alerts" },
        (payload: any) => {
          const row = payload.new;
          if (!row) return;
          fireNotification(row.alert_type ?? "Emergency Alert", row.description ?? "");
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}