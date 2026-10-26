export const dynamic = 'force-dynamic';
import { auth } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.28px", lineHeight: 1.1, margin: 0 }}>
          Notifications
        </h1>
        {unread > 0 && (
          <p style={{ fontSize: 17, color: "#7a7a7a", marginTop: 8 }}>
            {unread} unread
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifications.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "#7a7a7a", fontSize: 17 }}>
            No notifications yet.
          </div>
        )}
        {notifications.map((n) => (
          <div key={n.id} style={{
            background: n.isRead ? "#f5f5f7" : "#fff",
            border: n.isRead ? "1px solid #e0e0e0" : "1px solid #0066cc",
            borderRadius: 11,
            padding: "14px 20px",
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
          }}>
            {!n.isRead && (
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0066cc", flexShrink: 0, marginTop: 5 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{n.title}</div>
              <div style={{ fontSize: 13, color: "#7a7a7a", marginTop: 2 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: "#7a7a7a", marginTop: 6 }}>
                {new Date(n.createdAt).toLocaleString("en-IN")}
              </div>
            </div>
            {n.link && (
              <Link href={n.link} style={{ fontSize: 13, color: "#0066cc", textDecoration: "none", flexShrink: 0 }}>
                View →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
