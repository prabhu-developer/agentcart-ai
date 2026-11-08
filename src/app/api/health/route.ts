export async function GET() {
    return Response.json({
        success: true,
        service: "agentcart",
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
}