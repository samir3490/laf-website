type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
};

export default function PageContainer({
  children,
  className = "",
  narrow = false,
  wide = false,
}: PageContainerProps) {
  const width = narrow ? "max-w-4xl" : wide ? "max-w-[1720px]" : "max-w-[1400px]";
  return (
    <div className={`${width} mx-auto px-4 sm:px-6 lg:px-10 w-full ${className}`}>
      {children}
    </div>
  );
}
