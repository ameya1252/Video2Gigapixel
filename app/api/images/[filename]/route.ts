// This route is no longer needed for local development
// Images will be served directly from the public/output directory
export async function GET() {
  return new Response("This route is not used in local development", {
    status: 200,
  })
}
