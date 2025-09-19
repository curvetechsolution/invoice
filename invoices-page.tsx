import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Download, Eye, Edit, Filter, FileText } from "lucide-react"
import { Link } from "wouter"

// TODO: remove mock data - replace with real invoice data from API
const mockInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    clientName: "Acme Corporation",
    clientEmail: "contact@acme.com",
    issueDate: "2024-01-10",
    dueDate: "2024-01-25",
    currency: "USD",
    grandTotal: 5000,
    paidAmount: 5000,
    remainingBalance: 0,
    status: "paid"
  },
  {
    id: "2",
    invoiceNumber: "INV-002", 
    clientName: "Tech Solutions Ltd",
    clientEmail: "info@techsol.com",
    issueDate: "2024-01-15",
    dueDate: "2024-01-30",
    currency: "USD",
    grandTotal: 3500,
    paidAmount: 0,
    remainingBalance: 3500,
    status: "unpaid"
  },
  {
    id: "3",
    invoiceNumber: "INV-003",
    clientName: "Global Industries",
    clientEmail: "hello@global.com",
    issueDate: "2024-01-20",
    dueDate: "2024-02-05",
    currency: "USD", 
    grandTotal: 7200,
    paidAmount: 3600,
    remainingBalance: 3600,
    status: "partial"
  },
  {
    id: "4",
    invoiceNumber: "INV-004",
    clientName: "Startup Innovations",
    clientEmail: "team@startup.com",
    issueDate: "2024-01-25",
    dueDate: "2024-02-10",
    currency: "USD",
    grandTotal: 2800,
    paidAmount: 0,
    remainingBalance: 2800,
    status: "unpaid"
  },
  {
    id: "5",
    invoiceNumber: "INV-005",
    clientName: "Creative Agency",
    clientEmail: "hello@creative.com",
    issueDate: "2024-01-28",
    dueDate: "2024-02-12",
    currency: "PKR",
    grandTotal: 150000,
    paidAmount: 150000,
    remainingBalance: 0,
    status: "paid"
  }
]

const formatCurrency = (amount: number, currency: string) => {
  const symbols = { USD: "$", PKR: "Rs", EURO: "€", GBP: "£" }
  return `${symbols[currency as keyof typeof symbols]}${amount.toLocaleString()}`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "unpaid": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "partial": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export function InvoicesPage() {
  const [invoices] = useState(mockInvoices)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalInvoices = filteredInvoices.length
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
  const totalRemaining = filteredInvoices.reduce((sum, inv) => sum + inv.remainingBalance, 0)

  const handleDownloadPDF = (invoiceId: string) => {
    console.log(`Downloading PDF for invoice ${invoiceId}`)
    // TODO: implement PDF download functionality
  }

  const handleViewInvoice = (invoiceId: string) => {
    console.log(`Viewing invoice ${invoiceId}`)
    // TODO: implement invoice view functionality
  }

  const handleEditInvoice = (invoiceId: string) => {
    console.log(`Editing invoice ${invoiceId}`)
    // TODO: implement invoice edit functionality
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">All Invoices</h1>
          <p className="text-muted-foreground">Manage and track all your invoices</p>
        </div>
        <Link href="/invoice/create">
          <Button data-testid="button-create-new-invoice">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-invoice-search"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Filtered Invoices</p>
                <p className="text-2xl font-semibold" data-testid="text-filtered-count">{totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-semibold text-blue-600" data-testid="text-total-amount">
                ${totalAmount.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-semibold text-green-600" data-testid="text-total-paid-amount">
                ${totalPaid.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-semibold text-primary" data-testid="text-remaining-amount">
                ${totalRemaining.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoice(s) {statusFilter !== "all" && `with ${statusFilter} status`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No invoices found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Create your first invoice to get started"}
              </p>
              <Link href="/invoice/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Invoice
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground font-medium">Invoice</TableHead>
                  <TableHead className="text-primary-foreground font-medium">Client</TableHead>
                  <TableHead className="text-primary-foreground font-medium">Issue Date</TableHead>
                  <TableHead className="text-primary-foreground font-medium">Due Date</TableHead>
                  <TableHead className="text-primary-foreground font-medium text-right">Amount</TableHead>
                  <TableHead className="text-primary-foreground font-medium text-right">Paid</TableHead>
                  <TableHead className="text-primary-foreground font-medium text-right">Remaining</TableHead>
                  <TableHead className="text-primary-foreground font-medium">Status</TableHead>
                  <TableHead className="text-primary-foreground font-medium text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover-elevate" data-testid={`invoice-table-row-${invoice.id}`}>
                    <TableCell className="font-medium" data-testid={`cell-invoice-number-${invoice.id}`}>
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium" data-testid={`cell-client-name-${invoice.id}`}>
                          {invoice.clientName}
                        </p>
                        <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`cell-issue-date-${invoice.id}`}>
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell data-testid={`cell-due-date-${invoice.id}`}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-medium" data-testid={`cell-total-${invoice.id}`}>
                      {formatCurrency(invoice.grandTotal, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right" data-testid={`cell-paid-${invoice.id}`}>
                      {formatCurrency(invoice.paidAmount, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span 
                        className={`font-medium ${invoice.remainingBalance > 0 ? 'text-primary' : 'text-muted-foreground'}`}
                        data-testid={`cell-remaining-${invoice.id}`}
                      >
                        {formatCurrency(invoice.remainingBalance, invoice.currency)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={getStatusColor(invoice.status)}
                        data-testid={`cell-status-${invoice.id}`}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewInvoice(invoice.id)}
                          data-testid={`button-view-${invoice.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditInvoice(invoice.id)}
                          data-testid={`button-edit-${invoice.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadPDF(invoice.id)}
                          data-testid={`button-download-${invoice.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}