import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, User, Shield, Users, Copy, Check } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

// Comptes de test prédéfinis
const TEST_ACCOUNTS = {
  user: {
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
    label: 'Utilisateur',
    description: 'Compte utilisateur standard'
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    label: 'Administrateur',
    description: 'Compte administrateur avec tous les droits'
  },
  conseiller: {
    email: 'conseiller@example.com',
    password: 'conseiller123',
    role: 'conseiller',
    label: 'Conseiller',
    description: 'Compte conseiller professionnel'
  },
  superAdmin: {
    email: 'superadmin@example.com',
    password: 'superadmin123',
    role: 'super_admin',
    label: 'Super Admin',
    description: 'Compte super administrateur'
  }
}

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('user')
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Connexion réussie ! Redirection...')
        // Rediriger vers le dashboard approprié selon le rôle
        setTimeout(() => {
          if (data?.user?.user_metadata?.role === 'admin' || data?.user?.user_metadata?.role === 'super_admin') {
            navigate('/admin/dashboard')
          } else if (data?.user?.user_metadata?.role === 'conseiller') {
            navigate('/conseiller/dashboard')
          } else {
            navigate('/dashboard')
          }
        }, 1000)
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite')
    } finally {
      setLoading(false)
    }
  }

  const handleTestAccountClick = (accountKey: string) => {
    const account = TEST_ACCOUNTS[accountKey as keyof typeof TEST_ACCOUNTS]
    setEmail(account.email)
    setPassword(account.password)
    setActiveTab(accountKey)
  }

  const copyToClipboard = async (text: string, accountKey: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAccount(accountKey)
      setTimeout(() => setCopiedAccount(null), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return <Shield className="h-4 w-4" />
      case 'conseiller':
        return <Users className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800'
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'conseiller':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Formulaire de connexion */}
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Connexion
              </CardTitle>
              <CardDescription>
                Accédez à votre espace personnel
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Se souvenir de moi
                    </Label>
                  </div>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link 
                    to="/register" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    S'inscrire
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Comptes de test */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>🧪 Comptes de test</span>
              </CardTitle>
              <CardDescription>
                Utilisez ces comptes pour tester les différentes fonctionnalités
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  {Object.entries(TEST_ACCOUNTS).map(([key, account]) => (
                    <TabsTrigger key={key} value={key} className="text-xs">
                      {getRoleIcon(account.role)}
                      <span className="ml-1 hidden sm:inline">{account.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(TEST_ACCOUNTS).map(([key, account]) => (
                  <TabsContent key={key} value={key} className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(account.role)}
                          <span className="font-medium">{account.label}</span>
                          <Badge className={getRoleBadgeColor(account.role)}>
                            {account.role}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestAccountClick(key)}
                          className="text-xs"
                        >
                          Utiliser
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-600">{account.description}</p>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Email:</Label>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {account.email}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(account.email, `${key}-email`)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedAccount === `${key}-email` ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Mot de passe:</Label>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {account.password}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(account.password, `${key}-password`)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedAccount === `${key}-password` ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">⚠️ Important:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Pour la connexion admin, le serveur backend doit être démarré</li>
                  <li>• Utilisez <code className="bg-gray-100 px-1 rounded">cd backend && npm start</code></li>
                  <li>• Ou <code className="bg-gray-100 px-1 rounded">node src/server.js</code></li>
                  <li>• Les comptes de test sont automatiquement créés</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 