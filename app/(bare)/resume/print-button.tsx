'use client';

export function PrintButton() {
  return (
    <button type="button" className="btn btn-soft" onClick={() => window.print()}>
      Print
    </button>
  );
}
