'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useChat } from '@ai-sdk/react'
import { LockKeyhole, SendHorizontal, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'

const chatTransport = new DefaultChatTransport({ api: '/compare/chat' })

const suggestedQuestions = [
  'Compare les positions sur le pouvoir d’achat.',
  'Quels candidats proposent une réforme de l’école ?',
  'Où sont les divergences sur la transition écologique ?',
]

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

export function CompareChat() {
  const { data: session, isPending } = authClient.useSession()
  const [input, setInput] = useState('')
  const { error, messages, sendMessage, status } = useChat({ transport: chatTransport })
  const isAuthenticated = Boolean(session?.user)
  const isWorking = status === 'submitted' || status === 'streaming'
  const isDisabled = !isAuthenticated || isPending || isWorking

  async function submitQuestion(question: string) {
    const text = question.trim()

    if (!text || isDisabled) {
      return
    }

    setInput('')
    await sendMessage({ text })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitQuestion(input)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_0.28fr]">
      <Card className="min-h-[36rem] border-primary/15 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
        <CardHeader className="border-b border-border/70">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Sparkles className="size-5 text-primary" aria-hidden="true" />
            Chat comparatif
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[31rem] flex-col p-0">
          <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
            <div className="max-w-2xl rounded-2xl bg-secondary p-4 text-secondary-foreground">
              <p className="font-semibold">Bienvenue dans le comparateur.</p>
              <p className="mt-2 leading-7 text-muted-foreground">
                Posez une question sur un thème, un candidat, un parti ou une proposition. La
                réponse doit distinguer les éléments sourcés, les écarts et les limites des données.
              </p>
            </div>
            {!isAuthenticated && !isPending ? (
              <div className="flex max-w-2xl items-start gap-3 rounded-2xl border border-primary/20 bg-background/80 p-4">
                <LockKeyhole className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Connexion requise</p>
                  <p className="mt-1 leading-7 text-muted-foreground">
                    Le chat est visible mais désactivé pour les visiteurs anonymes.
                  </p>
                  <Button asChild className="mt-3" size="sm">
                    <Link href="/signin">Se connecter pour comparer</Link>
                  </Button>
                </div>
              </div>
            ) : null}
            {messages.map((message) => {
              const text = getMessageText(message)

              if (!text) {
                return null
              }

              return (
                <div
                  className={
                    message.role === 'user'
                      ? 'ml-auto max-w-2xl rounded-2xl bg-primary p-4 text-primary-foreground'
                      : 'max-w-2xl rounded-2xl border border-border bg-background/85 p-4 text-foreground'
                  }
                  key={message.id}
                >
                  <p className="whitespace-pre-wrap leading-7">{text}</p>
                </div>
              )
            })}
            {error ? (
              <p className="max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
                {error.message || 'La réponse n’a pas pu être générée.'}
              </p>
            ) : null}
          </div>
          <form className="border-t border-border/70 p-4 sm:p-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                className="min-h-24 flex-1 resize-none rounded-xl border border-input bg-background/85 px-4 py-3 text-base outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDisabled}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  isAuthenticated
                    ? 'Ex. Compare les positions sur la santé entre les principaux candidats.'
                    : 'Connectez-vous pour poser une question.'
                }
                value={input}
              />
              <Button
                className="sm:self-end"
                disabled={isDisabled || !input.trim()}
                size="lg"
                type="submit"
              >
                Envoyer
                <SendHorizontal aria-hidden="true" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <aside className="space-y-4">
        <Card className="bg-card/85 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Questions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedQuestions.map((question) => (
              <button
                className="w-full rounded-xl border border-border bg-background/75 p-3 text-left text-sm font-semibold leading-6 transition hover:border-primary/40 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDisabled}
                key={question}
                onClick={() => submitQuestion(question)}
                type="button"
              >
                {question}
              </button>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground/70">
              Garde-fou
            </p>
            <p className="mt-3 leading-7 text-primary-foreground/90">
              Les réponses doivent rester comparatives et indiquer quand les données du CMS sont
              insuffisantes.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
