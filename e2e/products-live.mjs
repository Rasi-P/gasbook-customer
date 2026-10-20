import { chromium, expect } from '@playwright/test'
import { mkdir, readFile } from 'node:fs/promises'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
const live = process.env.INVENTORY_LIVE_URL
if (!live?.startsWith('http://localhost:') && !live?.startsWith('http://127.0.0.1:')) throw new Error('Isolated live server required')
const users=JSON.parse(process.env.INVENTORY_FIXTURES)
const browser=await chromium.launch({headless:true})
const contexts=[]
await mkdir('test-results/products-live',{recursive:true})
async function app(role) {
 const context=await browser.newContext({viewport:{width:1280,height:900}});contexts.push(context);context.setDefaultTimeout(15000)
 await context.addInitScript(({role,user})=>{
  if(role==='customer') localStorage.setItem('gasbook_customer_auth',JSON.stringify({accessToken:user.access,refreshToken:user.refresh}))
  else {localStorage.setItem('gasbook_access',user.access);localStorage.setItem('gasbook_refresh',user.refresh);localStorage.setItem('gasbook_role',role)}
 },{role,user:users[role]})
 await context.route('**/api/**',route=>{const url=new URL(route.request().url());return route.continue({url:live+url.pathname+url.search})})
 await context.route('**/media/**',route=>{const url=new URL(route.request().url());return route.continue({url:live+url.pathname+url.search})})
 return context.newPage()
}
async function responsive(page,name) {
 for(const width of [320,375,390,414,768,1024,1280]) {
  await page.setViewportSize({width,height:900}); await page.waitForTimeout(80)
  const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}))
  expect(sizes.scroll,`${name} overflow at ${width}`).toBeLessThanOrEqual(sizes.width)
  if([320,390,1280].includes(width))await page.screenshot({path:`test-results/products-live/${name}-${width}.png`,fullPage:true})
 }
}
try {
 const admin=await app('admin');await admin.goto('http://127.0.0.1:5193/products')
 await admin.getByRole('button',{name:'Add product',exact:true}).click()
 await admin.getByLabel('Product name',{exact:true}).fill('Browser regulator')
 await admin.getByLabel('Description',{exact:true}).fill('Regulator for browser acceptance')
 await admin.getByLabel('Type/category',{exact:true}).fill('Regulator')
 await admin.getByLabel('Rate (Rs.)',{exact:true}).fill('250')
 await admin.getByLabel('Initial stock',{exact:true}).fill('4')
 await admin.getByLabel(/^Product image/).setInputFiles(process.env.INVENTORY_IMAGE)
 await admin.getByRole('button',{name:'Save product',exact:true}).click()
 const row=admin.getByRole('row').filter({hasText:'Browser regulator'})
 await expect(row).toBeVisible()
 await row.getByRole('button',{name:'Increase Browser regulator stock'}).click();await expect(row.locator('strong')).toHaveText('5')
 await row.getByRole('button',{name:'Decrease Browser regulator stock'}).click();await expect(row.locator('strong')).toHaveText('4')
 await row.getByLabel('Set Browser regulator stock').fill('6');await row.getByRole('button',{name:'Set',exact:true}).click();await expect(row.locator('strong')).toHaveText('6')
 await row.getByRole('button',{name:'Edit',exact:true}).click();await admin.getByLabel('Description',{exact:true}).fill('Edited regulator description');await admin.getByRole('button',{name:'Save product',exact:true}).click()
 await expect(row).toBeVisible();await responsive(admin,'admin-inventory')
 const customer=await app('customer');await customer.goto('http://127.0.0.1:5192/#explore')
 const visible=(locator)=>locator.filter({visible:true})
 await visible(customer.getByRole('button',{name:'Accessories (6)',exact:true})).click()
 await expect(visible(customer.locator('.accessory-card'))).toHaveCount(6)
 for(const img of await visible(customer.locator('.accessory-card img')).all()) {
  let retries=0
  // macOS's live test server can transiently exhaust socket buffers when both
  // responsive trees request images. Retry failed GETs only, never mutations.
  await expect.poll(async()=>{
   const state=await img.evaluate(el=>({complete:el.complete,width:el.naturalWidth}))
   if(state.complete&&!state.width&&retries<2){retries++;await img.evaluate((el,attempt)=>{const url=new URL(el.src);url.searchParams.set('image_retry',String(attempt));el.src=url.toString()},retries)}
   return state.complete&&state.width>0
  },{timeout:15000}).toBe(true)
 }
 await responsive(customer,'catalog')
 await visible(customer.getByRole('button',{name:'Gas Cylinders (1)',exact:true})).click()
 await visible(customer.getByRole('button',{name:/^Book/})).last().click()
 await visible(customer.getByRole('combobox',{name:/rate type/})).selectOption('new')
 await visible(customer.getByRole('button',{name:'Explore Cylinders',exact:true})).click()
 await visible(customer.getByRole('button',{name:'Accessories (6)',exact:true})).click()
 await visible(customer.locator('.accessory-card').filter({hasText:'Browser regulator'})).getByRole('button',{name:'Add to cart'}).click()
 await visible(customer.getByRole('button',{name:'Explore Cylinders',exact:true})).click()
 await visible(customer.getByRole('button',{name:'Accessories (6)',exact:true})).click()
 const hose=visible(customer.locator('.accessory-card').filter({hasText:'[DEMO] LPG gas hose'}))
 await hose.getByRole('button',{name:'Add to cart'}).click()
 const hoseCart=visible(customer.locator('.cart-product-card, .desktop-cart-layout > div:first-child > div').filter({hasText:'[DEMO] LPG gas hose'}))
 await hoseCart.getByRole('button',{name:'Increase quantity',exact:true}).click()
 await expect(hoseCart.locator('.qty-value, .desktop-qty-value')).toHaveText('2')
 await visible(customer.getByRole('button',{name:'Proceed to Order Summary'})).click()
 await expect(visible(customer.getByRole('button',{name:/Confirm & Place Order/}))).toBeEnabled()
 await responsive(customer,'checkout')
 const orderResponse=customer.waitForResponse(r=>r.url().includes('/api/bookings/checkout/')&&r.request().method()==='POST')
 await visible(customer.getByRole('button',{name:/Confirm & Place Order/})).click()
 const response=await orderResponse;expect(response.status()).toBe(201);const booking=await response.json();expect(booking.final_amount).toBe('1420.00');expect(booking.order_items).toHaveLength(3)
 await admin.goto('http://127.0.0.1:5193/bookings')
 await expect(admin.getByRole('row').filter({hasText:'Browser customer'})).toContainText('Browser regulator')
 await admin.getByRole('button',{name:'View details',exact:true}).click()
 await expect(admin.getByRole('dialog').locator('.bk-detail-items')).toContainText('Browser regulator')
 await admin.getByRole('button',{name:'Close details',exact:true}).click()
 await admin.getByLabel('Assign staff').selectOption(String(users.staff.id));await admin.getByRole('button',{name:'Approve & Assign',exact:true}).click()
 await expect(admin.getByText('Booking approved and assigned.',{exact:true})).toBeVisible()
 const staff=await app('staff');await staff.goto('http://127.0.0.1:5193/staff-dashboard')
 await staff.getByRole('button',{name:'Accept Assignment',exact:true}).first().click()
 await staff.getByRole('button',{name:'Start Delivery & Notify Customer',exact:true}).first().click()
 await expect(staff.locator('.bk-detail-items').first()).toContainText('Browser regulator')
 await expect(staff.locator('.sa-pay').first()).not.toContainText('Deposit:')
 await responsive(staff,'staff-details')
 await staff.getByLabel('Cash received (Rs.)',{exact:true}).first().fill('1420')
 await staff.getByRole('checkbox',{name:/I confirm the amount actually received/}).first().check()
 await staff.getByRole('button',{name:'Complete Delivery',exact:true}).first().click()
 await expect(staff.getByText('Delivery completed successfully!',{exact:true})).toBeVisible()
 await staff.getByRole('navigation',{name:'Staff navigation'}).getByRole('button',{name:'History',exact:true}).click()
 await staff.locator('.sa-history-card__details > summary').first().click()
 await expect(staff.locator('.sa-history-card__breakdown .bk-detail-items')).toContainText('Browser regulator')
 await visible(customer.getByRole('button',{name:'My Orders',exact:true})).click()
 await visible(customer.locator('summary').filter({hasText:'Items & pricing (3)'})).click()
 await expect(visible(customer.getByLabel('Booking items'))).toContainText('Browser regulator')
 await responsive(customer,'customer-history')
 await visible(customer.getByRole('button',{name:'View Receipt',exact:true})).click()
 const dialog=customer.getByRole('dialog');await expect(dialog.getByRole('button',{name:'Download PDF',exact:true})).toBeEnabled({timeout:30000})
 await expect(dialog.getByRole('img',{name:'Receipt page 1',exact:true})).toBeVisible({timeout:30000})
 const downloadPromise=customer.waitForEvent('download');await dialog.getByRole('button',{name:'Download PDF',exact:true}).click();const download=await downloadPromise
 expect(download.suggestedFilename()).toBe(`Sabco-Gas-Receipt-${booking.order_id}.pdf`)
 const bytes=await readFile(await download.path());expect(bytes.subarray(0,5).toString()).toBe('%PDF-')
 const task=getDocument({data:new Uint8Array(bytes)});const pdf=await task.promise;const text=(await(await pdf.getPage(1)).getTextContent()).items.map(i=>'str'in i?i.str:'').join(' ');expect(text).toContain('Browser regulator');expect(text).toContain('1,420.00');await task.destroy()
 console.log('PASS: admin add/edit/image/inline stock → Accessories tab → one mixed booking → existing admin assignment/staff delivery → history/PDF; responsive 320/375/390/414/768/1024/1280px.')
} catch(error) {
 for(let i=0;i<contexts.length;i++) for(const page of contexts[i].pages()){await page.screenshot({path:`test-results/products-live/failure-${i}.png`,fullPage:true});console.error((await page.locator('body').innerText()).slice(0,5000))}
 throw error
} finally {await browser.close()}
