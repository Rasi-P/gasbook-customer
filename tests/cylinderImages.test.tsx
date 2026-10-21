import { beforeEach, describe, expect, it } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { CatalogProductCard } from '../src/components/common/CatalogProductCard'
import { CylinderImage } from '../src/components/common/CylinderImage'
import { GENERIC_CYLINDER_IMAGE, SUPPORTED_CYLINDER_WEIGHTS, defaultCylinderImage, resolveCylinderImage, type CylinderImageSubject } from '../src/lib/cylinderImages'
import { API_BASE_URL, activeCylinderTypes, type CylinderTypeItem } from '../src/lib/auth'
import { cartCylinder, cylinderSubject, orderCylinder, registerCylinderImages } from '../src/lib/formatters'

// What <CylinderImage> shows first for a subject, and the SABCO default URL for a weight, in this app.
const pic = (subject: CylinderImageSubject) => resolveCylinderImage(subject, API_BASE_URL)
const sabco = (kg: number) => defaultCylinderImage(kg, API_BASE_URL)!
const byName = (name?: string, weight?: string | null) => pic(cylinderSubject({ name, weight }))

const type = (over: Partial<CylinderTypeItem>): CylinderTypeItem => ({
  id: 1, name: '5kg', weight: '5', selling_price: '450', deposit_amount: '300', refill_rate: '360', is_active: true, ...over,
})

beforeEach(() => registerCylinderImages([{ name: '5kg', image: null }, { name: '35kg', image: null }, { name: 'Big Blue', image: null }]))

it('uses the picture an admin uploaded for a cylinder type, by name and ignoring case and spacing', () => {
  registerCylinderImages([{ name: '35kg', image: 'https://api.example/media/cylinder-images/35.png' }])
  expect(byName('35kg', '35')).toBe('https://api.example/media/cylinder-images/35.png')
  expect(byName('  35KG ')).toBe('https://api.example/media/cylinder-images/35.png')
})

it('works for brand-new types whose name carries no weight', () => {
  registerCylinderImages([{ name: 'Big Blue', image: 'https://api.example/media/cylinder-images/blue.png' }])
  expect(byName('Big Blue', null)).toBe('https://api.example/media/cylinder-images/blue.png')
})

it('falls back to the SABCO default when no picture was uploaded, or it was removed', () => {
  expect(byName('5kg', '5')).toBe(sabco(5))
  expect(sabco(5)).toEndWith('/static/cylinders/sabco-5kg.png')
  registerCylinderImages([{ name: '5kg', image: 'https://api.example/media/cylinder-images/5.png' }])
  expect(byName('5kg', '5')).toBe('https://api.example/media/cylinder-images/5.png')
  registerCylinderImages([{ name: '5kg', image: null }])
  expect(byName('5kg', '5')).toBe(sabco(5))
  expect(byName('Unknown thing')).toBe(GENERIC_CYLINDER_IMAGE)
  expect(byName(undefined)).toBe(GENERIC_CYLINDER_IMAGE)
})

it('offers only active cylinder types for new bookings but keeps the rest for history', () => {
  const all = [type({ id: 1 }), type({ id: 2, name: '12kg', is_active: false }), type({ id: 3, name: '19kg', is_active: undefined as unknown as boolean })]
  expect(activeCylinderTypes(all).map((t) => t.id)).toEqual([1, 3])
  expect(all).toHaveLength(3)
})

describe('cart lines, order cards and product cards', () => {
  const custom = 'https://api.example/media/cylinder-images/commercial.png'
  // A cart line keeps the display title in `name` and the weight badge in `variant` (see HomeScreen.handleBook).
  const line = { cylinderTypeId: 901, name: '19 KG Cylinder', variant: '19 KG' }

  it('finds a cart line\'s custom picture by cylinder type id, not by its display labels', () => {
    registerCylinderImages([{ id: 901, name: 'Commercial', weight: '19.00', image: custom }])
    expect(pic(cartCylinder(line))).toBe(custom)
  })

  it('shows the weight default on a cart line once the custom picture is removed', () => {
    registerCylinderImages([{ id: 901, name: 'Commercial', weight: '19.00', image: null }])
    expect(pic(cartCylinder(line))).toBe(sabco(19))
  })

  it('follows a weight change made after the line was added to the cart', () => {
    registerCylinderImages([{ id: 901, name: 'Commercial', weight: '33.00', image: null }])
    expect(pic(cartCylinder(line))).toBe(sabco(33))
  })

  it('uses the line\'s own weight before the catalog has loaded', () => {
    expect(pic(cartCylinder({ cylinderTypeId: 999_999, name: '4 KG Cylinder', variant: '4 KG' }))).toBe(sabco(4))
  })

  it('shows an order card\'s custom picture by its booking\'s cylinder type', () => {
    registerCylinderImages([{ id: 902, name: 'Mini', weight: '2.00', image: custom }])
    const order = { productName: '2 KG Cylinder', weight: '2 KG', rawBooking: { cylinder_type_id: 902, cylinder_type_name: 'Mini', cylinder_type_weight: '2.00' } }
    expect(pic(orderCylinder(order))).toBe(custom)
    registerCylinderImages([{ id: 902, name: 'Mini', weight: '2.00', image: null }])
    expect(pic(orderCylinder(order))).toBe(sabco(2))
    // A direct-sale history row carries the type as `cylinder_type`.
    expect(pic(orderCylinder({ productName: '14 KG Cylinder', weight: '14 KG', rawBooking: { cylinder_type: 999_998 } }))).toBe(sabco(14))
    expect(pic(orderCylinder({ productName: 'Mixed order', weight: 'Items' }))).toBe(GENERIC_CYLINDER_IMAGE)
  })

  it('renders the custom picture first and the default when there is none', () => {
    const withCustom = renderToStaticMarkup(<CylinderImage cylinder={{ image: custom, weight: '12' }} alt="12 KG" />)
    expect(withCustom).toContain(`src="${custom}"`)
    expect(withCustom).toContain('data-cylinder-image="primary"')
    const noCustom = renderToStaticMarkup(<CylinderImage cylinder={{ image: null, weight: '12' }} alt="12 KG" />)
    expect(noCustom).toContain(`src="${sabco(12)}"`)
    expect(renderToStaticMarkup(<CylinderImage cylinder={{ weight: '35' }} />)).toContain(`src="${GENERIC_CYLINDER_IMAGE}"`)
  })

  it('gives every catalog product card a picture, never the category text', () => {
    for (const kg of SUPPORTED_CYLINDER_WEIGHTS) {
      const html = renderToStaticMarkup(<CatalogProductCard kind="cylinder" name={`${kg} KG Cylinder`} category={`${kg} KG`} description="" image={null}
        cylinder={cylinderSubject({ id: 950 + kg, name: `${kg}kg`, weight: `${kg}.00` })} price={1} actionLabel="Book" onAdd={() => {}} />)
      expect(html).toContain(`src="${sabco(kg)}"`)
    }
  })
})
