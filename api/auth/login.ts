
export function GET() {
  return new Response('hello world');
}

export const config = {
  runtime: 'nodejs',
};