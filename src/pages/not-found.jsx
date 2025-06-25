export default function NotFound({ params }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-start text-center">
        <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance lg:text-4xl">
          404 | <span className="text-xl lg:text-2xl">Page not found</span>
        </h1>
        <p className="[&:not:first-child(mt-6)] tracking-tight text-balance">
          The {params['*']} page is not found or doesn&apos;t exist
        </p>
      </div>
    </div>
  );
}
