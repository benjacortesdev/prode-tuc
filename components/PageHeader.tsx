interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
