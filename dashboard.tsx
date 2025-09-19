import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, TrendingUp, DollarSign, Clock, Filter, Plus } from "lucide-react"
import { Link } from "wouter"
import { useState } from "react"

// TODO: remove mock data - replace with real data from API
const mockDashboardData = {
  totalInvoices: 45,
  totalSales: 125000,
  totalPaid: 98000,
  totalRemaining: 27000,
  recentInvoices: [
    {
      id: "1",
      invoiceNumber: "INV-001",
      clientName: "Acme Corp",
      amount: 5000,
      currency: "USD",
      status: "paid",
      dueDate: "2024-01-15"
    },
    {
      id: "2",
      invoiceNumber: "INV-002",
      clientName: "Tech Solutions",
      amount: 3500,
      currency: "USD",
      status: "unpaid",
      dueDate: "2024-01-20"
    },
    {
      id: "3",
      invoiceNumber: "INV-003",
      clientName: "Global Industries",
      amount: 7200,
      currency: "USD",
      status: "partial",
      dueDate: "2024-01-25"
    }
  ]
}

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

export function Dashboard() {
  const [filter, setFilter] = useState("all")
  const [filteredInvoices, setFilteredInvoices] = useState(mockDashboardData.recentInvoices)

  const handleFilterChange = (value: string) => {
    console.log(`Filter changed to: ${value}`)
    setFilter(value)
    if (value === "all") {
      setFilteredInvoices(mockDashboardData.recentInvoices)
    } else {
      setFilteredInvoices(mockDashboardData.recentInvoices.filter(invoice => invoice.status === value))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your invoice management system</p>
        </div>
        <Link href="/invoice/create">
          <Button data-testid="button-create-invoice">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-invoices">
              {mockDashboardData.totalInvoices}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-sales">
              {formatCurrency(mockDashboardData.totalSales, "USD")}
            </div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-paid">
              {formatCurrency(mockDashboardData.totalPaid, "USD")}
            </div>
            <p className="text-xs text-muted-foreground">Received payments</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="text-remaining-balance">
              {formatCurrency(mockDashboardData.totalRemaining, "USD")}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest invoices and their status</CardDescription>
            </div>
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-32" data-testid="select-invoice-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No invoices match the selected filter</p>
            ) : (
              filteredInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`invoice-row-${invoice.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium" data-testid={`text-invoice-number-${invoice.id}`}>
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.clientName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium" data-testid={`text-amount-${invoice.id}`}>
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      className={getStatusColor(invoice.status)}
                      data-testid={`badge-status-${invoice.id}`}
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          {filteredInvoices.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Link href="/invoices">
                <Button variant="ghost" className="w-full" data-testid="button-view-all-invoices">
                  View All Invoices
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}