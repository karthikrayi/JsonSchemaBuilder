import React from 'react';
import SchemaBuilder  from './components/SchemaBuilder';

export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">JSON Schema Builder</h1>
      <SchemaBuilder />
    </div>
  );
}
