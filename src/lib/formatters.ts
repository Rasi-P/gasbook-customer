import splashCylinder from '../assets/splash_cylinder.png'
import cylinder5kg from '../assets/cylinder_5kg.png'
import cylinder12kg from '../assets/cylinder_12kg.png'
import cylinder17kg from '../assets/cylinder_17kg.png'
import cylinder19kg from '../assets/cylinder_19kg.png'
import cylinder21kg from '../assets/cylinder_21kg.png'

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

export function getCylinderImage(rawName?: string, rawWeight?: string | number | null): string {
  const str = `${rawName || ''} ${rawWeight || ''}`.toLowerCase();
  
  if (str.includes('5kg') || str.includes('5 kg') || str.trim() === '5' || str.startsWith('5 ') || str.includes('5.0')) {
    return cylinder5kg;
  }
  if (str.includes('12kg') || str.includes('12 kg') || str.trim() === '12' || str.startsWith('12 ') || str.includes('12.0')) {
    return cylinder12kg;
  }
  if (str.includes('17kg') || str.includes('17 kg') || str.trim() === '17' || str.startsWith('17 ') || str.includes('17.0')) {
    return cylinder17kg;
  }
  if (str.includes('19kg') || str.includes('19 kg') || str.trim() === '19' || str.startsWith('19 ') || str.includes('19.0')) {
    return cylinder19kg;
  }
  if (str.includes('21kg') || str.includes('21 kg') || str.trim() === '21' || str.startsWith('21 ') || str.includes('21.0')) {
    return cylinder21kg;
  }

  return splashCylinder;
}



