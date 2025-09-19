import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Upload, Save, Building2, CreditCard, FileImage } from "lucide-react"

export function SettingsPage() {
  const [companyData, setCompanyData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
    bankAccountInfo: ""
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
        setCompanyData({...companyData, logo: result})
        console.log("Logo uploaded")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    console.log("Saving company settings:", companyData)
    // TODO: implement actual save functionality
  }

  const handleReset = () => {
    setCompanyData({
      name: "",
      address: "",
      phone: "",
      email: "",
      logo: "",
      bankAccountInfo: ""
    })
    setLogoPreview(null)
    console.log("Settings reset")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Company Settings</h1>
          <p className="text-muted-foreground">Configure your company information for invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} data-testid="button-reset-settings">
            Reset
          </Button>
          <Button onClick={handleSave} data-testid="button-save-settings">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                This information will appear on all your invoices as a watermark
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  placeholder="Your Company Name"
                  data-testid="input-company-name"
                />
              </div>

              <div>
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                  placeholder="123 Business Street&#10;City, State 12345&#10;Country"
                  rows={3}
                  data-testid="textarea-company-address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyPhone">Phone Number</Label>
                  <Input
                    id="companyPhone"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                    placeholder="+1-555-123-4567"
                    data-testid="input-company-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Email Address</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                    placeholder="contact@company.com"
                    data-testid="input-company-email"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Company Logo
              </CardTitle>
              <CardDescription>
                Upload your company logo to display on invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={logoPreview} 
                        alt="Company logo preview" 
                        className="w-full h-full object-contain"
                        data-testid="img-logo-preview"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="logoUpload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover-elevate">
                        <Upload className="h-4 w-4" />
                        <span>Upload Logo</span>
                      </div>
                    </Label>
                    <Input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      data-testid="input-logo-upload"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, or SVG recommended
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Bank account details to display on invoices for client payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="bankInfo">Bank Account Information</Label>
                <Textarea
                  id="bankInfo"
                  value={companyData.bankAccountInfo}
                  onChange={(e) => setCompanyData({...companyData, bankAccountInfo: e.target.value})}
                  placeholder="Bank Name: Your Bank&#10;Account Name: Your Company Name&#10;Account Number: 123456789&#10;Routing Number: 987654321&#10;SWIFT Code: ABCD1234 (for international)"
                  rows={5}
                  data-testid="textarea-bank-info"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This information will be displayed on invoices for client reference
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
              <CardDescription>
                Preview how your company information will appear on invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="text-center opacity-50 space-y-2">
                  {logoPreview && (
                    <div className="flex justify-center mb-3">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="h-12 object-contain opacity-30"
                      />
                    </div>
                  )}
                  {companyData.name && (
                    <h3 className="font-semibold text-sm" data-testid="preview-company-name">
                      {companyData.name}
                    </h3>
                  )}
                  {companyData.address && (
                    <p className="text-xs whitespace-pre-line" data-testid="preview-company-address">
                      {companyData.address}
                    </p>
                  )}
                  <div className="flex justify-center gap-4 text-xs">
                    {companyData.phone && (
                      <span data-testid="preview-company-phone">{companyData.phone}</span>
                    )}
                    {companyData.email && (
                      <span data-testid="preview-company-email">{companyData.email}</span>
                    )}
                  </div>
                  {!companyData.name && !companyData.address && !companyData.phone && !companyData.email && (
                    <p className="text-xs text-muted-foreground italic">
                      Fill in company information to see preview
                    </p>
                  )}
                </div>
              </div>

              {companyData.bankAccountInfo && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-medium text-sm mb-2">Payment Information</h4>
                    <div className="border rounded-lg p-3 bg-muted/30">
                      <p className="text-xs whitespace-pre-line opacity-70" data-testid="preview-bank-info">
                        {companyData.bankAccountInfo}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}