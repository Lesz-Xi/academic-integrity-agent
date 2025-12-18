import { useState, useEffect } from 'react';

export interface DirectivePreset {
  id: string;
  name: string;
  instructions: string;
  createdAt: number;
}

const STORAGE_KEY = 'scholar_directive_presets';

export function usePresets() {
  const [presets, setPresets] = useState<DirectivePreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse presets', e);
      }
    }
    setLoading(false);
  }, []);

  const savePreset = (name: string, instructions: string) => {
    const newPreset: DirectivePreset = {
      id: crypto.randomUUID(),
      name,
      instructions,
      createdAt: Date.now(),
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newPreset;
  };

  const deletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updatePreset = (id: string, name: string, instructions: string) => {
    const updated = presets.map(p => 
      p.id === id ? { ...p, name, instructions } : p
    );
    setPresets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    presets,
    loading,
    savePreset,
    deletePreset,
    updatePreset
  };
}
