import { expect, it } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { PaymentSummary, type PaymentFacts } from '../src/components/common/PaymentSummary'
const value: PaymentFacts = { sale_id:1,total_amount:'1000',paid_amount:'400',balance_due:'600',status:'PARTIAL',payments:[{id:1,amount:'100',mode:'cash',kind:'payment',created_at:'2026-10-15T18:30:00Z'},{id:2,amount:'300',mode:'gpay',kind:'payment',created_at:'2026-10-16T07:00:00Z'}] }
it('renders partial/split and later payments using saved amounts and IST dates',()=>{
 const html=renderToStaticMarkup(<PaymentSummary value={value} />)
 for(const text of ['₹400.00','₹600.00','₹100.00','₹300.00','Cash','UPI / GPay','16 Oct 2026']) expect(html).toContain(text)
 expect(html).not.toContain('staff');expect(html).toMatch(/12:00 am IST/i)
})
it('omits absent facts and preserves cancelled/refund entries',()=>{
 expect(renderToStaticMarkup(<PaymentSummary />)).toBe('')
 const html=renderToStaticMarkup(<PaymentSummary value={{...value,status:'CANCELLED',balance_due:'0',payments:[...value.payments,{id:3,amount:'-400',mode:'bank',kind:'refund',created_at:'2026-10-16T10:00:00Z'}]}} />)
 expect(html).toContain('Originally paid');expect(html).toContain('Cancelled');expect(html).toContain('Refund');expect(html).toContain('₹-400.00')
})
