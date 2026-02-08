"use client";

export default function HistoryControls({ undo, redo }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex gap-4">
        <button
          onClick={undo}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        >
          Undo
        </button>
        <button
          onClick={redo}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        >
          Redo
        </button>
      </div>
    </div>
  );
}