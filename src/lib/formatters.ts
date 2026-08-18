export function getCylinderDisplay(rawName: string, rawWeight?: string | number | null) {
  // If weight is provided by the API, use it directly
  if (rawWeight !== undefined && rawWeight !== null) {
    const weightNum = parseFloat(rawWeight.toString());
    if (!isNaN(weightNum) && weightNum > 0) {
      return {
        title: `${weightNum} KG Cylinder`, // e.g., "19 KG Cylinder"
        badge: `${weightNum} KG`, // e.g., "19 KG"
      };
    }
  }

  // Fallback for missing weight: attempt to parse "19kg" from name
  if (rawName) {
    const kgMatch = rawName.match(/(\d+(?:\.\d+)?)\s*kg/i);
    if (kgMatch) {
      const parsed = parseFloat(kgMatch[1]);
      return {
        title: `${parsed} KG Cylinder`,
        badge: `${parsed} KG`,
      };
    }
  }

  return {
    title: rawName || 'Gas Cylinder',
    badge: 'Cylinder',
  };
}
