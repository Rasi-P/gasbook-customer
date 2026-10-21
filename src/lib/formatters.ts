import type { CylinderImageSubject } from './cylinderImages'

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

// What the catalog says about each cylinder type (custom picture and current weight), by id and by name. Filled
// whenever the catalog is fetched, so uploads, removals and weight changes show everywhere (cart, orders,
// history) without a code change. <CylinderImage> turns a subject into a picture (./cylinderImages).
type Registered = { image: string | null; weight?: unknown }
const registeredById = new Map<number, Registered>()
const registeredByName = new Map<string, Registered>()
const imageKey = (name?: string | null) => (name ?? '').trim().toLowerCase()

export function registerCylinderImages(types: ReadonlyArray<{ id?: number; name: string; weight?: unknown; image?: string | null }>) {
  for (const type of types) {
    const entry: Registered = { image: type.image || null, weight: type.weight }
    if (typeof type.id === 'number') registeredById.set(type.id, entry)
    const key = imageKey(type.name)
    if (key) registeredByName.set(key, entry)
  }
}

/** Everything known about a cylinder type for picking its picture. The catalog's current weight wins over a copy
 *  saved earlier (a cart line, an order label), so a weight change shows the new weight's default. */
export function cylinderSubject({ id, name, weight }: { id?: number | null; name?: string | null; weight?: unknown }): CylinderImageSubject {
  const registered = (typeof id === 'number' ? registeredById.get(id) : undefined) ?? registeredByName.get(imageKey(name))
  return { image: registered?.image ?? null, weight: registered?.weight ?? weight, name }
}

/** The cylinder an order card shows: its type (by id) when the booking carries one, else its labels. */
export function orderCylinder(order: { productName?: string; weight?: string; rawBooking?: { cylinder_type_id?: number | null; cylinder_type?: number | null; cylinder_type_name?: string | null; cylinder_type_weight?: unknown } | null }): CylinderImageSubject {
  const booking = order.rawBooking ?? {}
  return cylinderSubject({
    id: booking.cylinder_type_id ?? booking.cylinder_type ?? null,
    name: booking.cylinder_type_name ?? order.productName,
    weight: booking.cylinder_type_weight ?? order.weight,
  })
}

/** The cylinder a cart line shows. A line keeps the display title in `name` and the weight badge in `variant`. */
export const cartCylinder = (item: { cylinderTypeId?: number; name: string; variant: string }): CylinderImageSubject =>
  cylinderSubject({ id: item.cylinderTypeId, name: item.name, weight: item.variant })
