export default function AppFooter() {
  return (
    <footer className="bg-secondary/20 py-6 text-center">
      <div className="container mx-auto">
        <p className="text-sm text-secondary-foreground/80">
          © {new Date().getFullYear()} Nursery Rhyme Swinger. Fun times for everyone!
        </p>
      </div>
    </footer>
  );
}
