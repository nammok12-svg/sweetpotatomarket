export default function FormAlert({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`rounded-lg px-3.5 py-3 text-sm ${
        error
          ? "bg-danger/8 text-danger"
          : "bg-success/8 text-success"
      }`}
    >
      {error ?? message}
    </p>
  );
}
