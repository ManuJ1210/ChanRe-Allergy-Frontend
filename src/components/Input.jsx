import React from 'react';

export default function Input({ label, icon, type = 'text', name, value, onChange, required = true }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm bg-white">
        <span className="text-gray-500 mr-2">{icon}</span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full outline-none border-none bg-transparent text-gray-800"
          required={required}
        />
      </div>
    </div>
  );
}
