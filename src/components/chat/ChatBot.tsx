import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "./ChatMessage"
import { Send, MessageCircle, X } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  content: string
  isBot: boolean
  timestamp: string
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Bonjour ! Je suis votre assistant d'orientation. Comment puis-je vous aider aujourd'hui ?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      content: input,
      isBot: false,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const { data: apiKeyData, error: secretError } = await supabase
        .from('api_keys')
        .select('value')
        .eq('name', 'PERPLEXITY_API_KEY')
        .single()

      if (secretError || !apiKeyData) {
        throw new Error("Impossible de récupérer la clé API")
      }

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeyData.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: `Tu es un assistant spécialisé en orientation scolaire et professionnelle au Congo. 
              Ton rôle est d'aider les étudiants à :
              - Comprendre les différentes filières d'études disponibles au Congo
              - Explorer les opportunités professionnelles dans différents secteurs
              - Identifier leurs points forts et domaines d'intérêt
              - Prendre des décisions éclairées concernant leur avenir académique et professionnel
              - Comprendre le système éducatif congolais et les parcours possibles
              - Connaître les débouchés des différentes formations
              
              Sois précis, encourageant et adapte toujours tes réponses au contexte congolais.
              Donne des exemples concrets d'établissements et de parcours quand c'est pertinent.
              Si tu ne connais pas une information spécifique, oriente l'étudiant vers des ressources fiables.`
            },
            {
              role: 'user',
              content: input
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur de communication avec l'API")
      }

      const responseData = await response.json()
      
      const botMessage = {
        content: responseData.choices[0].message.content,
        isBot: true,
        timestamp: new Date().toLocaleTimeString()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la communication avec l'assistant."
      })
      const errorMessage = {
        content: "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre question ?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-[400px] h-[600px] shadow-2xl rounded-2xl flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar online showBorder showAnimation pulseAnimation>
                <AvatarImage
                  src="/ai-avatar.png"
                  alt="Assistant Avatar"
                />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Assistant d'orientation</h3>
                <p className="text-xs text-muted-foreground">En ligne</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                content={message.content}
                isBot={message.isBot}
                timestamp={message.timestamp}
              />
            ))}
          </div>

          <form onSubmit={sendMessage} className="border-t p-4 bg-background/95">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  )
}
