"use client"

import type React from "react"

import { useState } from "react"
import { loginService } from "@/lib/apiService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      await loginService(email, password)
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err.message || "Erro ao autenticar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
            <p className="text-muted-foreground">Sistema de Gestão para Reforma de Tênis</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Acesso de Funcionários</CardTitle>
            <CardDescription className="text-center">Entre com suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="funcionario@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center mb-2">
                <strong>Credenciais de demonstração:</strong>
              </p>
              <div className="text-sm space-y-2">
                <div>
                  <p><strong>Admin:</strong></p>
                  <p>Email: admin@email.com</p>
                  <p>Senha: 123456</p>
                </div>
                <div>
                  <p><strong>Atendimento:</strong></p>
                  <p>Email: atendimento@email.com</p>
                  <p>Senha: 123456</p>
                </div>
                <div>
                  <p><strong>Pintura:</strong></p>
                  <p>Email: pintura@email.com</p>
                  <p>Senha: 123456</p>
                </div>
                <div>
                  <p><strong>Lavagem:</strong></p>
                  <p>Email: lavagem@email.com</p>
                  <p>Senha: 123456</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 {process.env.NEXT_PUBLIC_APP_NAME}. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}
