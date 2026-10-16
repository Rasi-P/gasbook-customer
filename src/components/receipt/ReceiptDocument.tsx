import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import type { ReceiptData } from '../../lib/receipt'
import { formatDateTime } from '../../lib/dateTime'

const styles = StyleSheet.create({
  page: { fontFamily: 'ReceiptNoto', fontSize: 10, color: '#21334b', paddingTop: 104, paddingBottom: 55, paddingHorizontal: 40 },
  header: { position: 'absolute', top: 30, left: 40, right: 40, borderBottomWidth: 2, borderColor: '#1052be', paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 64, height: 40, objectFit: 'contain', marginRight: 12, backgroundColor: '#1052be', borderRadius: 4 },
  brand: { fontSize: 20, fontWeight: 700, color: '#1052be' },
  heading: { fontSize: 17, fontWeight: 700, marginBottom: 5 },
  label: { fontSize: 9, color: '#556579' },
  section: { marginBottom: 16 },
  bold: { fontWeight: 700 },
  status: { backgroundColor: '#edf3fc', padding: 10, marginBottom: 16 },
  cancelled: { backgroundColor: '#fff0ef', color: '#a02424', padding: 10, marginBottom: 16 },
  tableHead: { flexDirection: 'row', backgroundColor: '#edf3fc', padding: 8, fontWeight: 700 },
  line: { padding: 8, borderBottomWidth: 1, borderColor: '#dbe3ee' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  description: { width: '49%', paddingRight: 12 },
  quantity: { width: '9%', textAlign: 'center' },
  unit: { width: '21%', textAlign: 'right', paddingRight: 10 },
  amount: { width: '21%', textAlign: 'right' },
  component: { marginTop: 4, fontSize: 9, color: '#556579' },
  totals: { marginTop: 18, marginLeft: 'auto', width: '68%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 4 },
  total: { borderTopWidth: 1, borderColor: '#1052be', fontWeight: 700, fontSize: 12 },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, height: 18, fontSize: 8, color: '#556579', flexDirection: 'row', justifyContent: 'space-between' },
})
const money = (value: string) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const scaled = (unit: string, quantity: number) => money(String(Math.round(Number(unit) * 100) * quantity / 100))

/** One A4 template for every transaction. All payable amounts come from the saved receipt data. */
export function ReceiptDocument({ receipt: r, logo }: { receipt: ReceiptData; logo?: string }) {
  const totalRow = (label: string, amount: string | null, strong = false) => amount !== null && (
    <View style={strong ? [styles.totalRow, styles.total] : styles.totalRow}>
      <Text>{label}</Text><Text>{money(amount)}</Text>
    </View>
  )
  return <Document title={`${r.business.name} Receipt ${r.number}`} author={r.business.name} language="en-IN">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header} fixed>
        <View style={styles.row}>{logo && <Image src={logo} style={styles.logo} />}<Text style={styles.brand}>{r.business.name}</Text></View>
        <View><Text style={styles.bold}>RECEIPT</Text><Text>{r.number}</Text></View>
      </View>
      {(r.business.address || r.business.phone || r.business.email || r.business.tax_id) && <View style={styles.section}>
        {r.business.address && <Text>{r.business.address}</Text>}
        {r.business.phone && <Text>{r.business.phone}</Text>}
        {r.business.email && <Text>{r.business.email}</Text>}
        {r.business.tax_id && <Text>Tax registration: {r.business.tax_id}</Text>}
      </View>}
      <View style={styles.section} minPresenceAhead={70}>
        <Text style={styles.heading}>{r.transaction_type} · {r.number}</Text>
        <Text>{r.source === 'sale' ? 'Recorded' : 'Booked'}: {formatDateTime(r.created_at)}</Text>
      </View>
      <View style={r.cancelled ? styles.cancelled : styles.status}>
        <Text style={styles.bold}>{r.status} · {r.payment_status}</Text>
        {r.cancelled && <Text>Cancelled transaction. The original total below is not an amount currently due.</Text>}
        {!r.cancelled && r.source === 'booking' && r.status !== 'Delivered' && <Text>Order summary. Delivery has not been completed.</Text>}
        {r.cancelled_at && <Text>Cancelled / rejected: {formatDateTime(r.cancelled_at)}</Text>}
        {r.cancellation_reason && <Text>{r.cancellation_reason}</Text>}
        {r.refunded_at && <Text>Refund confirmed: {formatDateTime(r.refunded_at)}</Text>}
      </View>
      <View style={styles.section}>
        <Text style={[styles.label, styles.bold]} minPresenceAhead={30}>CUSTOMER</Text>
        <Text style={styles.bold}>{r.customer.name}</Text>
        {r.customer.phone && <Text>{r.customer.phone}</Text>}
        {r.customer.email && <Text>{r.customer.email}</Text>}
        {r.customer.address && <Text>{r.customer.address}</Text>}
      </View>
      <View style={styles.tableHead} minPresenceAhead={65}>
        <Text style={styles.description}>Item / pricing</Text><Text style={styles.quantity}>Qty</Text>
        <Text style={styles.unit}>Unit (INR)</Text><Text style={styles.amount}>Net amount</Text>
      </View>
      {r.items.map((item, index) => <View key={index} style={styles.line} wrap={false}>
        <View style={styles.row}>
          <View style={styles.description}>
            <Text style={styles.bold}>{item.description}</Text>
            {item.rate_type && <Text style={styles.label}>{item.rate_type === 'new' ? 'New Cylinder' : 'Refill'}</Text>}
            {item.unit_amount !== null && <Text style={styles.label}>{item.unit_label}</Text>}
          </View>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <Text style={styles.unit}>{item.unit_amount !== null ? money(item.unit_amount) : '—'}</Text>
          <Text style={styles.amount}>{money(item.total_amount)}</Text>
        </View>
        {item.rate_type === 'new' && item.deposit_unit_amount !== null && <Text style={styles.component}>
          Deposit: {money(item.deposit_unit_amount)} × {item.quantity} = {scaled(item.deposit_unit_amount, item.quantity)}
        </Text>}
        {item.refill_unit_amount !== null && <Text style={styles.component}>
          Refill charge: {money(item.refill_unit_amount)} × {item.quantity} = {scaled(item.refill_unit_amount, item.quantity)}
        </Text>}
      </View>)}
      <View style={styles.totals} wrap={false}>
        {totalRow(Number(r.discount_amount) > 0 ? 'Subtotal before discount' : 'Subtotal', r.subtotal)}
        {Number(r.discount_amount) > 0 && totalRow('Discount', `-${r.discount_amount}`)}
        {totalRow(r.cancelled ? 'Original transaction total' : 'Total payable', r.total_amount, true)}
        {totalRow(r.cancelled ? 'Originally collected' : 'Amount paid', r.paid_amount)}
        {totalRow('Outstanding balance', r.balance_due)}
        {totalRow('Refund paid', r.refund_amount)}
        {totalRow('Refund pending', r.refund_due)}
        {totalRow('Customer credit', r.credit_amount)}
      </View>
      <View style={[styles.section, { marginTop: 20 }]}>
        <Text>Payment status: {r.payment_status}</Text>
        {r.payment_method && <Text>Payment method: {r.payment_method}</Text>}
        {r.delivery_partner && <Text>Delivery partner: {r.delivery_partner}</Text>}
        {r.completed_at && <Text>Delivered: {formatDateTime(r.completed_at)}</Text>}
      </View>
      <View style={styles.footer} fixed>
        <Text>{r.business.name} · {r.number} · All amounts in INR</Text>
      </View>
      <Text fixed style={{ position: 'absolute', bottom: 28, right: 40, width: 110, height: 18, fontFamily: 'ReceiptNoto', fontSize: 8, textAlign: 'right' }} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </Page>
  </Document>
}
