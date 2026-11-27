import { expect, it } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { SafetyGuideView } from '../src/components/views/SafetyGuideView'
import { isActiveTab, readNavState } from '../src/lib/uiState'

it('supports the safety guide as a restorable navigation destination', () => {
  expect(isActiveTab('safety')).toBe(true)
  expect(readNavState({ gasbookTab: 'safety', previousTab: 'home', trackingBookingId: null })?.gasbookTab).toBe('safety')
})

it('shows immediate leak guidance, accessible topics and official source links', () => {
  const html = renderToStaticMarkup(<SafetyGuideView onBack={() => {}} />)
  expect(html).toContain('Smell gas right now?')
  expect(html).toContain('href="tel:112"')
  expect(html).toContain('href="tel:1906"')
  expect(html).toContain('authorised technician')
  expect(html).toContain('aria-expanded="true"')
  expect(html.match(/aria-controls=/g)).toHaveLength(4)
  expect(html.match(/role="region"/g)).toHaveLength(4)
  expect(html).toContain('https://pmuy.gov.in/Safety_Pledge.aspx')
})

it('loads no external video until requested and always offers the official video link', () => {
  const html = renderToStaticMarkup(<SafetyGuideView onBack={() => {}} />)
  expect(html).not.toContain('<iframe')
  expect(html).toContain('Watch safety video')
  expect(html).toContain('https://www.youtube.com/watch?v=oKXem5gT-2A')
  expect(html).toContain('BPCL India')
})
