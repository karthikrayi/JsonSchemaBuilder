import React, { useState, useEffect } from 'react';

type Field = {
  id: string;
  name: string;
  type: 'string' | 'number' | 'nested';
  nested?: Field[];
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function SchemaBuilder() {
  const [fields, setFields] = useState<Field[]>([]);
  const [preview, setPreview] = useState<Record<string, any>>({});

  // Build the type-view schema: show "String" or "Number" labels
  useEffect(() => {
    const build = (arr: Field[]): any =>
      arr.reduce((obj, f) => {
        if (!f.name) return obj;
        if (f.type === 'nested') {
          obj[f.name] = build(f.nested || []);
        } else if (f.type === 'number') {
          obj[f.name] = 'Number';
        } else {
          obj[f.name] = 'String';
        }
        return obj;
      }, {} as Record<string, any>);
    setPreview(build(fields));
  }, [fields]);

  // Utility to update nested state immutably by path
  function updateAt(path: number[], fn: (arr: Field[]) => void) {
    setFields(old => {
      const clone = JSON.parse(JSON.stringify(old)) as Field[];
      let arr = clone;
      for (const i of path) arr = arr[i].nested!;
      fn(arr);
      return clone;
    });
  }

  function addField(path: number[] = []) {
    const f: Field = { id: generateId(), name: '', type: 'string', nested: [] };
    updateAt(path, arr => arr.push(f));
  }

  function removeField(path: number[]) {
    const parent = path.slice(0, -1);
    const idx = path[path.length - 1];
    updateAt(parent, arr => arr.splice(idx, 1));
  }

  function updateField(path: number[], key: keyof Field, value: any) {
    const parent = path.slice(0, -1);
    updateAt(parent, arr => {
      const f = arr[path[path.length - 1]];
      (f as any)[key] = value;
      if (key === 'type') {
        if (value === 'nested' && !f.nested) f.nested = [];
        if (value !== 'nested') delete f.nested;
      }
    });
  }

  function renderFields(arr: Field[], path: number[] = []): JSX.Element[] {
    return arr.map((f, i) => {
      const cur = [...path, i];
      return (
        <div key={f.id} className="ml-4 mt-2 p-2 border rounded bg-gray-50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={f.name}
              placeholder="Field Name"
              onChange={e => updateField(cur, 'name', e.target.value)}
              className="flex-1 border px-2 py-1 rounded"
            />
            <select
              value={f.type}
              onChange={e => updateField(cur, 'type', e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="nested">nested</option>
            </select>
            <button
              onClick={() => removeField(cur)}
              className="px-2 py-1 bg-red-500 text-white rounded"
            >
              ✕
            </button>
          </div>

          {f.type === 'nested' && (
            <>
              {renderFields(f.nested || [], cur)}
              <button
                onClick={() => addField(cur)}
                className="mt-1 px-2 py-1 bg-blue-500 text-white rounded"
              >
                + Add Nested
              </button>
            </>
          )}
        </div>
      );
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">JSON Schema Builder</h1>

      <div className="space-y-4">
        {renderFields(fields)}
        <button
          onClick={() => addField()}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          + Add Field
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold">JSON Preview</h2>
        <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
          {JSON.stringify(preview, null, 2)}
        </pre>
      </div>
    </div>
  );
}
