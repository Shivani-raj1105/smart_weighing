"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Scale, History, Settings, Shield, HelpCircle, LogOut } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAppContext } from "@/lib/app-context"
import { auth, sendEmailVerificationToCurrentUser, updateUserEmail } from "@/lib/firebase"

type ActiveSection = null | "account" | "privacy" | "help"

interface ProfileScreenProps {
  onSaveSuccess?: () => void
}

export function ProfileScreen({ onSaveSuccess }: ProfileScreenProps) {
  const { user, setIsAuthenticated, setUser, measurementHistory } = useAppContext()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState<ActiveSection>(null)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const [nameField, setNameField] = useState("")
  const [emailField, setEmailField] = useState("")
  const [phoneField, setPhoneField] = useState("")
  const [ageField, setAgeField] = useState("")
  const [sexField, setSexField] = useState<"male" | "female" | "other" | "">("")
  const [heightField, setHeightField] = useState("")

  useEffect(() => {
    if (!user) return
    setNameField(user.name || "")
    setEmailField(user.email || "")
    setPhoneField(user.phone || "")
    setAgeField(user.age?.toString() || "")
    setSexField(user.sex || "")
    setHeightField(user.height?.toString() || "")
  }, [user])

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    const hasFirebaseUser = Boolean(auth.currentUser)

    setSaving(true)

    try {
      let updatedEmail = user.email

      if (emailField && emailField !== user.email) {
        if (hasFirebaseUser) {
          if (!auth.currentUser?.emailVerified) {
            await sendEmailVerificationToCurrentUser(auth.currentUser)
            toast({
              title: "Email verification required",
              description: "Please verify your current email address before changing it. A verification email was sent.",
            })
            // keep existing email until user verifies
          } else {
            await updateUserEmail(auth.currentUser, emailField)
            await sendEmailVerificationToCurrentUser(auth.currentUser)
            updatedEmail = emailField
            toast({
              title: "Email change requested",
              description: "A verification email was sent to your new email address.",
            })
          }
        } else {
          updatedEmail = emailField
          toast({
            title: "Email updated locally",
            description: "Profile email was updated in app state.",
          })
        }
      }

      setUser({
        ...user,
        name: nameField,
        email: updatedEmail,
        phone: phoneField,
        age: Number(ageField) || undefined,
        sex: sexField as "male" | "female" | "other",
        height: Number(heightField) || undefined,
      })

      toast({ title: "Saved", description: "Profile settings updated successfully." })
      setEditMode(false)
      onSaveSuccess?.()
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message || "Please try again." })
    } finally {
      setSaving(false)
    }
  }

  const stats = [
    { 
      icon: Scale, 
      label: "Measurements", 
      value: measurementHistory.length.toString(),
      color: "text-primary"
    },
    { 
      icon: History, 
      label: "This Week", 
      value: measurementHistory.filter(r => 
        new Date(r.timestamp) > new Date(Date.now() - 7 * 86400000)
      ).length.toString(),
      color: "text-accent"
    },
  ]

  const menuItems = [
    { icon: Settings, label: "Account Settings", desc: "View your account details", section: "account" as const },
    { icon: Shield, label: "Privacy & Security", desc: "Data protection settings", section: "privacy" as const },
    { icon: HelpCircle, label: "Help & Support", desc: "FAQs and contact", section: "help" as const },
  ]

  // Account Settings Section
  const renderAccountSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <button
        onClick={() => setActiveSection(null)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Back to Profile
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Account Settings</h2>
        <Button
          size="sm"
          variant={editMode ? "secondary" : "outline"}
          onClick={() => {
            if (!user) return
            if (!editMode) {
              setEditMode(true)
            } else {
              setEditMode(false)
            }
          }}
        >
          {editMode ? "Cancel" : "Edit"}
        </Button>
      </div>

      <Card className="bg-card/30 backdrop-blur-sm border-border/30">
        <CardContent className="p-4 space-y-4">
          {editMode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Full Name</label>
                <Input
                  value={nameField}
                  onChange={(e) => setNameField(e.target.value)}
                  placeholder="Full Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Email Address</label>
                <Input
                  type="email"
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                  placeholder="Email Address"
                />
                {!auth.currentUser?.emailVerified && (
                  <p className="text-xs text-warning">Please verify your current email before making email changes. If you already requested verification, complete it from your inbox.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Phone Number</label>
                <Input
                  type="tel"
                  value={phoneField}
                  onChange={(e) => setPhoneField(e.target.value)}
                  placeholder="Phone Number"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Age</label>
                  <Input
                    type="number"
                    min={1}
                    max={150}
                    value={ageField}
                    onChange={(e) => setAgeField(e.target.value)}
                    placeholder="Age"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Sex</label>
                  <select
                    value={sexField}
                    onChange={(e) => setSexField(e.target.value as "male" | "female" | "other")}
                    className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-border/50 text-foreground text-sm"
                  >
                    <option value="" disabled>Select sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Height (cm)</label>
                <Input
                  type="number"
                  min={0}
                  value={heightField}
                  onChange={(e) => setHeightField(e.target.value)}
                  placeholder="Height"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : (
            <>
              <div className="py-2 border-b border-border/30">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-foreground">{user?.name || "Not set"}</p>
              </div>

              <div className="py-2 border-b border-border/30">
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-foreground">{user?.email || "Not set"}</p>
                <p className={`text-xs mt-1 ${auth.currentUser?.emailVerified ? "text-emerald-500" : "text-amber-500"}`}>
                  {auth.currentUser?.emailVerified ? "Verified" : "Unverified"}
                </p>
              </div>

              <div className="py-2 border-b border-border/30">
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-foreground">{user?.phone || "Not set"}</p>
              </div>

              <div className="py-2 border-b border-border/30">
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="text-foreground">{user?.age ? `${user.age} years` : "Not set"}</p>
              </div>

              <div className="py-2 border-b border-border/30">
                <p className="text-xs text-muted-foreground">Sex</p>
                <p className="text-foreground capitalize">{user?.sex || "Not set"}</p>
              </div>

              <div className="py-2">
                <p className="text-xs text-muted-foreground">Height</p>
                <p className="text-foreground">{user?.height ? `${user.height} cm` : "Not set"}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  // Privacy & Security Section
  const renderPrivacySecurity = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <button
        onClick={() => setActiveSection(null)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Back to Profile
      </button>

      <h2 className="text-xl font-bold text-foreground">Privacy & Security</h2>

      <Card className="bg-card/30 backdrop-blur-sm border-border/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            At WeighScale Pro, we are committed to protecting your privacy and ensuring the security of your personal information. 
            We collect only the data necessary to provide you with accurate weight measurements and analytics. 
            Your measurement history is stored securely and encrypted at rest. We do not share your personal data with third parties 
            without your explicit consent, except as required by law. You have full control over your data and can request its deletion 
            at any time through our support channels. Our application uses industry-standard security protocols including SSL/TLS 
            encryption for data transmission and secure authentication mechanisms to protect your account. We regularly update our 
            security measures to address emerging threats and maintain compliance with applicable data protection regulations.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Help & Support Section
  const renderHelpSupport = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <button
        onClick={() => setActiveSection(null)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Back to Profile
      </button>

      <h2 className="text-xl font-bold text-foreground">Help & Support</h2>

      <Card className="bg-card/30 backdrop-blur-sm border-border/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to WeighScale Pro Help & Support. If you are experiencing any issues with your weight measurements, 
            device connectivity, or account access, our support team is here to assist you. For common questions, please 
            refer to our FAQ section within the app. If you need to calibrate your scale, navigate to the device settings 
            and follow the on-screen instructions. For technical support, you can reach us via email at support@weighscalepro.com 
            or call our helpline at 1-800-WEIGH-PRO (Monday to Friday, 9 AM - 6 PM EST). For urgent issues related to 
            measurement accuracy in medical or industrial settings, please contact our priority support line. We typically 
            respond to all inquiries within 24-48 business hours. Your feedback helps us improve our service, so please 
            do not hesitate to share your experience with us.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <motion.div
      className="min-h-screen pb-20 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="px-4 pt-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeSection === "account" ? (
            renderAccountSettings()
          ) : activeSection === "privacy" ? (
            renderPrivacySecurity()
          ) : activeSection === "help" ? (
            renderHelpSupport()
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Profile Header */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <Card className="bg-gradient-to-br from-primary/20 to-accent/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-xl font-bold text-primary-foreground">U</span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-foreground">{user?.name || "User"}</h2>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {user?.email || "user@example.com"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {stats.map((stat, index) => (
                  <Card key={index} className="bg-card/30 backdrop-blur-sm border-border/30">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <stat.icon className="w-4 h-4 text-primary-foreground" />
                        <p className={`text-xs font-semibold ${stat.color}`}>{stat.label}</p>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              {/* Menu Items */}
              <motion.div
                className="space-y-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {menuItems.map((item, index) => (
                  <Card 
                    key={index} 
                    className="bg-card/30 backdrop-blur-sm border-border/30 hover:bg-card/50 transition-colors cursor-pointer"
                    onClick={() => setActiveSection(item.section)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>



              {/* App Info */}
              <motion.div
                className="text-center text-xs text-muted-foreground space-y-1"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p>WeighScale Pro v1.0.0</p>
                <p>Precision Measurement System</p>
              </motion.div>

              {/* Logout */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="destructive"
                  className="w-full gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
