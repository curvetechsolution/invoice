import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Users, Mail, Phone } from "lucide-react"

// TODO: remove mock data - replace with real client data from API
const mockClients = [
  {
    id: "1",
    name: "Acme Corporation",
    email: "contact@acme.com",
    phone: "+1-555-0101",
    address: "123 Business St, City, State 12345",
    totalInvoices: 12,
    totalAmount: 45000,
    status: "active"
  },
  {
    id: "2", 
    name: "Tech Solutions Ltd",
    email: "info@techsol.com",
    phone: "+1-555-0102",
    address: "456 Tech Ave, City, State 12346",
    totalInvoices: 8,
    totalAmount: 28000,
    status: "active"
  },
  {
    id: "3",
    name: "Global Industries",
    email: "hello@global.com", 
    phone: "+1-555-0103",
    address: "789 Corporate Blvd, City, State 12347",
    totalInvoices: 15,
    totalAmount: 67500,
    status: "active"
  },
  {
    id: "4",
    name: "Startup Innovations",
    email: "team@startup.com",
    phone: "+1-555-0104", 
    address: "321 Innovation Dr, City, State 12348",
    totalInvoices: 3,
    totalAmount: 9500,
    status: "inactive"
  }
]

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalInvoices: number
  totalAmount: number
  status: string
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatAmount = (amount: number) => `$${amount.toLocaleString()}`

  const handleAddClient = () => {
    if (newClient.name && newClient.email) {
      const client: Client = {
        id: Date.now().toString(),
        ...newClient,
        totalInvoices: 0,
        totalAmount: 0,
        status: "active"
      }
      setClients([...clients, client])
      setNewClient({ name: "", email: "", phone: "", address: "" })
      setIsAddDialogOpen(false)
      console.log("Added new client:", client)
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setNewClient({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    })
    console.log("Editing client:", client.id)
  }

  const handleUpdateClient = () => {
    if (editingClient && newClient.name && newClient.email) {
      setClients(clients.map(client => 
        client.id === editingClient.id 
          ? { ...client, ...newClient }
          : client
      ))
      setEditingClient(null)
      setNewClient({ name: "", email: "", phone: "", address: "" })
      console.log("Updated client:", editingClient.id)
    }
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(client => client.id !== clientId))
    console.log("Deleted client:", clientId)
  }

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Client Management</h1>
          <p className="text-muted-foreground">Manage your clients and their information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-client">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Create a new client profile for your invoices</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="Enter client name"
                  data-testid="input-client-name"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="Enter email address"
                  data-testid="input-client-email"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  placeholder="Enter phone number"
                  data-testid="input-client-phone"
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Address</Label>
                <Input
                  id="clientAddress"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  placeholder="Enter address"
                  data-testid="input-client-address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddClient} data-testid="button-save-client">
                Add Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-client-search"
            />
          </div>
        </div>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-semibold" data-testid="text-total-clients">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-semibold text-green-600" data-testid="text-active-clients">
                  {clients.filter(c => c.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No clients found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Add your first client to get started"}
            </p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover-elevate" data-testid={`client-card-${client.id}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-client-name-${client.id}`}>
                      {client.name}
                    </CardTitle>
                    <Badge className={getStatusColor(client.status)} data-testid={`badge-client-status-${client.id}`}>
                      {client.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditClient(client)}
                      data-testid={`button-edit-client-${client.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteClient(client.id)}
                      data-testid={`button-delete-client-${client.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground" data-testid={`text-client-email-${client.id}`}>
                      {client.email}
                    </span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground" data-testid={`text-client-phone-${client.id}`}>
                        {client.phone}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Invoices</p>
                      <p className="font-medium" data-testid={`text-client-invoices-${client.id}`}>
                        {client.totalInvoices}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="font-medium" data-testid={`text-client-total-${client.id}`}>
                        {formatAmount(client.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={editingClient !== null} onOpenChange={() => setEditingClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="editClientName">Client Name</Label>
              <Input
                id="editClientName"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                placeholder="Enter client name"
                data-testid="input-edit-client-name"
              />
            </div>
            <div>
              <Label htmlFor="editClientEmail">Email</Label>
              <Input
                id="editClientEmail"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                placeholder="Enter email address"
                data-testid="input-edit-client-email"
              />
            </div>
            <div>
              <Label htmlFor="editClientPhone">Phone</Label>
              <Input
                id="editClientPhone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                placeholder="Enter phone number"
                data-testid="input-edit-client-phone"
              />
            </div>
            <div>
              <Label htmlFor="editClientAddress">Address</Label>
              <Input
                id="editClientAddress"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                placeholder="Enter address"
                data-testid="input-edit-client-address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateClient} data-testid="button-update-client">
              Update Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}