const html = String.raw;

export default function GET(request: Request) {
  return new Response(
    html`
      <form action="/api/oauth/login" method="post">
        <label for="handle">Handle</label>
        <input type="text" id="handle" name="handle" />
        <button type="submit">Submit</button>
      </form>
    `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    },
  );
}
