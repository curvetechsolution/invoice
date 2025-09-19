import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Download, Save, Calendar } from "lucide-react"
import { z } from "zod"

const currencies = [
  { value: "PKR", label: "PKR (₨)", symbol: "Rs" },
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EURO", label: "EURO (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
]

// TODO: remove mock data - replace with real client data from API
const mockClients = [
  { id: "1", name: "Acme Corp", email: "contact@acme.com", phone: "+1-555-0101" },
  { id: "2", name: "Tech Solutions", email: "info@techsol.com", phone: "+1-555-0102" },
  { id: "3", name: "Global Industries", email: "hello@global.com", phone: "+1-555-0103" },
]

interface InvoiceItem {
  id: string
  title: string
  description: string
  unitPrice: number
  quantity: number
  discountType: "none" | "fixed" | "percentage"
  discountValue: number
  total: number
}

const calculateItemTotal = (item: InvoiceItem) => {
  const baseAmount = item.unitPrice * item.quantity
  let discount = 0
  
  if (item.discountType === "fixed") {
    discount = item.discountValue
  } else if (item.discountType === "percentage") {
    discount = (baseAmount * item.discountValue) / 100
  }
  
  return Math.max(0, baseAmount - discount)
}

export function InvoiceForm() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    clientId: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    currency: "USD",
    taxRate: 0,
    depositPercentage: 0,
    notes: "",
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      title: "",
      description: "",
      unitPrice: 0,
      quantity: 1,
      discountType: "none",
      discountValue: 0,
      total: 0
    }
  ])

  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" })

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      title: "",
      description: "",
      unitPrice: 0,
      quantity: 1,
      discountType: "none",
      discountValue: 0,
      total: 0
    }
    setItems([...items, newItem])
    console.log("Added new invoice item")
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
    console.log(`Removed item ${id}`)
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        updatedItem.total = calculateItemTotal(updatedItem)
        return updatedItem
      }
      return item
    }))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = (subtotal * invoiceData.taxRate) / 100
  const grandTotal = subtotal + taxAmount
  const depositAmount = (grandTotal * invoiceData.depositPercentage) / 100
  const remainingBalance = grandTotal - depositAmount

  const selectedCurrency = currencies.find(c => c.value === invoiceData.currency)
  const formatAmount = (amount: number) => `${selectedCurrency?.symbol}${amount.toFixed(0)}`

  const handleSave = () => {
    console.log("Saving invoice...", { invoiceData, items })
    // TODO: implement actual save functionality
  }

  const handleDownloadPDF = () => {
    console.log("Downloading PDF...")
    // TODO: implement PDF generation
  }

  const handleAddClient = () => {
    if (newClient.name) {
      console.log("Adding new client:", newClient)
      setShowNewClientForm(false)
      setNewClient({ name: "", email: "", phone: "" })
      // TODO: implement actual client creation
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Create Invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for your client</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF} data-testid="button-download-pdf">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleSave} data-testid="button-save-invoice">
            <Save className="h-4 w-4 mr-2" />
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                    data-testid="input-invoice-number"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={invoiceData.currency} onValueChange={(value) => setInvoiceData({...invoiceData, currency: value})}>
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={invoiceData.issueDate}
                    onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
                    data-testid="input-issue-date"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                    data-testid="input-due-date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client">Select Client</Label>
                <div className="flex gap-2">
                  <Select value={invoiceData.clientId} onValueChange={(value) => setInvoiceData({...invoiceData, clientId: value})}>
                    <SelectTrigger data-testid="select-client" className="flex-1">
                      <SelectValue placeholder="Choose existing client" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewClientForm(!showNewClientForm)}
                    data-testid="button-add-client"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showNewClientForm && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <Label>Add New Client</Label>
                  <Input
                    placeholder="Client Name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    data-testid="input-new-client-name"
                  />
                  <Input
                    placeholder="Email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    data-testid="input-new-client-email"
                  />
                  <Input
                    placeholder="Phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    data-testid="input-new-client-phone"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddClient} data-testid="button-save-client">
                      Save Client
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowNewClientForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Invoice Items</CardTitle>
                <Button size="sm" onClick={addItem} data-testid="button-add-item">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 p-3 bg-primary text-primary-foreground rounded-lg mb-4">
                <div className="col-span-3 text-sm font-medium">Title</div>
                <div className="col-span-3 text-sm font-medium">Description</div>
                <div className="col-span-2 text-sm font-medium">Unit Price</div>
                <div className="col-span-1 text-sm font-medium">Qty</div>
                <div className="col-span-2 text-sm font-medium">Discount</div>
                <div className="col-span-1 text-sm font-medium text-right">Total</div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border rounded-lg items-end" data-testid={`invoice-item-${index}`}>
                    <div className="col-span-3">
                      <Input
                        placeholder="Item title"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                        data-testid={`input-item-title-${index}`}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        data-testid={`input-item-description-${index}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.unitPrice || ""}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        data-testid={`input-item-price-${index}`}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        data-testid={`input-item-quantity-${index}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="flex gap-1">
                        <Select value={item.discountType} onValueChange={(value) => updateItem(item.id, 'discountType', value)}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="percentage">%</SelectItem>
                          </SelectContent>
                        </Select>
                        {item.discountType !== "none" && (
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.discountValue || ""}
                            onChange={(e) => updateItem(item.id, 'discountValue', parseFloat(e.target.value) || 0)}
                            data-testid={`input-item-discount-${index}`}
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-between items-center">
                      <span className="font-medium" data-testid={`text-item-total-${index}`}>
                        {formatAmount(item.total)}
                      </span>
                      {items.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          data-testid={`button-remove-item-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}\n              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Additional notes or instructions..."
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                data-testid="textarea-notes"
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span data-testid="text-subtotal">{formatAmount(subtotal)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="taxRate" className="text-sm">Tax %:</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    value={invoiceData.taxRate || ""}
                    onChange={(e) => setInvoiceData({...invoiceData, taxRate: parseFloat(e.target.value) || 0})}
                    className="w-16 h-8"
                    data-testid="input-tax-rate"
                  />
                </div>
                
                <div className="flex justify-between">
                  <span>Tax Amount:</span>
                  <span data-testid="text-tax-amount">{formatAmount(taxAmount)}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Grand Total:</span>
                  <span data-testid="text-grand-total">{formatAmount(grandTotal)}</span>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Label htmlFor="depositPercentage" className="text-sm">Deposit %:</Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={invoiceData.depositPercentage || ""}
                    onChange={(e) => setInvoiceData({...invoiceData, depositPercentage: parseFloat(e.target.value) || 0})}
                    className="w-16 h-8"
                    data-testid="input-deposit-percentage"
                  />
                </div>

                <div className="flex justify-between">
                  <span>Deposit Amount:</span>
                  <span data-testid="text-deposit-amount">{formatAmount(depositAmount)}</span>
                </div>

                <div className="p-3 bg-primary text-primary-foreground rounded-lg">
                  <div className="flex justify-between font-medium">
                    <span>Remaining Balance:</span>
                    <span data-testid="text-remaining-balance">{formatAmount(remainingBalance)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}