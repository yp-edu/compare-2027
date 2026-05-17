'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useChat } from '@ai-sdk/react'
import { LockKeyhole, SendHorizontal, Sparkles } from 'lucide-react'
import { marked } from 'marked'
import xss from 'xss'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OfflineGuard } from '@/components/pwa/offline-guard'
import { useOnlineStatus } from '@/components/pwa/use-online-status'
import { CompareResponseFeedback } from '@/features/feedback/components/compare-response-feedback'
import { authClient } from '@/lib/auth-client'
import { isLegalConsentCurrent } from '@/lib/legal'
import { cn } from '@/lib/utils'

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

function getPreviousUserMessageText(messages: UIMessage[], messageIndex: number) {
  for (let index = messageIndex - 1; index >= 0; index -= 1) {
    const message = messages[index]

    if (message?.role === 'user') {
      return getMessageText(message)
    }
  }

  return ''
}

type MarkdownMessageProps = {
  isUser: boolean
  text: string
}

function renderMarkdown(text: string) {
  const html = marked.parse(text, { async: false, breaks: true, gfm: true }) as string

  // User and model messages are rendered as HTML, so sanitize after Markdown parsing.
  return xss(html)
}

function MarkdownMessage({ isUser, text }: MarkdownMessageProps) {
  const html = renderMarkdown(text)

  return (
    <div
      className={cn(
        'break-words leading-7',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        '[&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4',
        '[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:pl-4',
        '[&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.92em]',
        '[&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:leading-8',
        '[&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:leading-8',
        '[&_h3]:mb-2 [&_h3]:font-bold',
        '[&_li]:pl-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5',
        '[&_p]:mb-3',
        '[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:text-sm [&_pre]:leading-6',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
        '[&_td]:border-t [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
        '[&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold',
        '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5',
        isUser
          ? '[&_a]:text-primary-foreground [&_blockquote]:border-primary-foreground/40 [&_blockquote]:text-primary-foreground/90 [&_code]:bg-primary-foreground/15 [&_td]:border-primary-foreground/30 [&_th]:bg-primary-foreground/10 [&_th]:text-primary-foreground'
          : '[&_a]:text-primary [&_blockquote]:border-primary/30 [&_blockquote]:text-muted-foreground [&_code]:bg-secondary [&_code]:text-secondary-foreground [&_td]:border-border/70 [&_th]:bg-secondary [&_th]:text-secondary-foreground',
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function ThinkingIndicator() {
  return (
    <div
      aria-live="polite"
      className="flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-background/85 p-4 text-sm font-semibold text-muted-foreground"
      role="status"
    >
      <span>Réflexion...</span>
      <span className="flex gap-1" aria-hidden="true">
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 delay-150" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 delay-300" />
      </span>
    </div>
  )
}

type CompareChatProps = {
  feedbackEnabled?: boolean
}

export function CompareChat({ feedbackEnabled = false }: CompareChatProps) {
  const { data: session, isPending } = authClient.useSession()
  const { isOffline } = useOnlineStatus()
  const [input, setInput] = useState('')
  const { error, messages, sendMessage, status } = useChat({ transport: chatTransport })
  const isAuthenticated = Boolean(session?.user)
  const hasLegalConsent = isLegalConsentCurrent(session?.user)
  const isWorking = status === 'submitted' || status === 'streaming'
  const lastMessage = messages.at(-1)
  const isAwaitingAssistantResponse =
    isWorking &&
    (!lastMessage || lastMessage.role !== 'assistant' || !getMessageText(lastMessage).trim())
  const isDisabled = !isAuthenticated || !hasLegalConsent || isPending || isWorking || isOffline

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
            {isAuthenticated && !hasLegalConsent && !isPending ? (
              <div className="flex max-w-2xl items-start gap-3 rounded-2xl border border-primary/20 bg-background/80 p-4">
                <LockKeyhole className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Consentement requis</p>
                  <p className="mt-1 leading-7 text-muted-foreground">
                    Confirmez les CGU, la confidentialité et la neutralité avant d’utiliser le chat.
                  </p>
                  <Button asChild className="mt-3" size="sm">
                    <Link href="/consent?next=/compare">Confirmer et comparer</Link>
                  </Button>
                </div>
              </div>
            ) : null}
            <OfflineGuard
              className="max-w-2xl"
              message="Le chat comparatif nécessite une connexion Internet. Les pages déjà chargées restent lisibles hors ligne."
            />
            {messages.map((message, messageIndex) => {
              const text = getMessageText(message)
              const question = getPreviousUserMessageText(messages, messageIndex)
              const showFeedback =
                feedbackEnabled &&
                isAuthenticated &&
                message.role === 'assistant' &&
                Boolean(question) &&
                !(isWorking && messageIndex === messages.length - 1)

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
                  <MarkdownMessage isUser={message.role === 'user'} text={text} />
                  {showFeedback ? (
                    <CompareResponseFeedback
                      answer={text}
                      messageId={message.id}
                      question={question}
                    />
                  ) : null}
                </div>
              )
            })}
            {isAwaitingAssistantResponse ? <ThinkingIndicator /> : null}
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
                  isOffline
                    ? 'Reconnectez-vous pour poser une question.'
                    : isAuthenticated
                      ? hasLegalConsent
                        ? 'Ex. Compare les positions sur la santé entre les principaux candidats.'
                        : 'Confirmez les conditions pour poser une question.'
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
              Les réponses doivent rester comparatives et indiquer quand les données disponibles
              sont insuffisantes.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
