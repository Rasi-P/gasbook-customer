import { beforeEach, expect, it } from 'bun:test'
import { activeCylinderTypes, type CylinderTypeItem } from '../src/lib/auth'
import { getCylinderImage, registerCylinderImages } from '../src/lib/formatters'

const type = (over: Partial<CylinderTypeItem>): CylinderTypeItem => ({
  id: 1, name: '5kg', weight: '5', selling_price: '450', deposit_amount: '300', refill_rate: '360', is_active: true, ...over,
})

beforeEach(() => registerCylinderImages([{ name: '5kg', image: null }, { name: '35kg', image: null }, { name: 'Big Blue', image: null }]))

it('uses the picture an admin uploaded for a cylinder type, by name and ignoring case and spacing', () => {
  registerCylinderImages([{ name: '35kg', image: 'https://api.example/media/cylinder-images/35.png' }])
  expect(getCylinderImage('35kg', '35')).toBe('https://api.example/media/cylinder-images/35.png')
  expect(getCylinderImage('  35KG ')).toBe('https://api.example/media/cylinder-images/35.png')
})

it('works for brand-new types whose name carries no weight', () => {
  registerCylinderImages([{ name: 'Big Blue', image: 'https://api.example/media/cylinder-images/blue.png' }])
  expect(getCylinderImage('Big Blue', null)).toBe('https://api.example/media/cylinder-images/blue.png')
})

it('falls back to the built-in artwork when no picture was uploaded, or it was removed', () => {
  const builtIn = getCylinderImage('5kg', '5')
  registerCylinderImages([{ name: '5kg', image: 'https://api.example/media/cylinder-images/5.png' }])
  expect(getCylinderImage('5kg', '5')).toBe('https://api.example/media/cylinder-images/5.png')
  registerCylinderImages([{ name: '5kg', image: null }])
  expect(getCylinderImage('5kg', '5')).toBe(builtIn)
  expect(getCylinderImage('Unknown thing')).toBe(getCylinderImage(undefined))
})

it('offers only active cylinder types for new bookings but keeps the rest for history', () => {
  const all = [type({ id: 1 }), type({ id: 2, name: '12kg', is_active: false }), type({ id: 3, name: '19kg', is_active: undefined as unknown as boolean })]
  expect(activeCylinderTypes(all).map((t) => t.id)).toEqual([1, 3])
  expect(all).toHaveLength(3)
})
