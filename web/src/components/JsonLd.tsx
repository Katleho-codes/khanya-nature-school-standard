export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Content is generated from trusted CMS fields in this demo.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
