export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// SSE endpoint — streams pipeline counts every 5s
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      async function push() {
        try {
          const counts = await prisma.sample.groupBy({
            by: ["status"],
            _count: { status: true },
          });
          const data = JSON.stringify(
            counts.reduce((acc, r) => ({ ...acc, [r.status]: r._count.status }), {} as Record<string, number>)
          );
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          controller.close();
        }
      }

      await push();
      const interval = setInterval(push, 5000);

      // Close after 2 minutes to prevent stale connections
      setTimeout(() => { clearInterval(interval); controller.close(); }, 120_000);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
