export default function Settings() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <div className="text-neutral-400 text-sm space-y-2">
        <p>Import/Export & categories config will live here.</p>
        <ul className="list-disc list-inside">
          <li>Export: JSON (full DB), CSV (transactions)</li>
          <li>Import: CSV with column mapping + validation</li>
          <li>Seed/Reset local data</li>
        </ul>
      </div>
    </div>
  );
}
