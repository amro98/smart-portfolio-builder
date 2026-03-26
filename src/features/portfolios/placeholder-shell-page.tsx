interface PlaceholderShellPageProps {
  title: string;
  description: string;
}

export default function PlaceholderShellPage({ title, description }: PlaceholderShellPageProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
