'use client'

import { AlertTriangle } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'

type FeedbackStatus = 'idle' | 'editing' | 'submitting' | 'submitted' | 'error'

type ClaimFreshnessFeedbackProps = {
  answer: string
  claimId: string
  messageId: string
  question: string
}

export function ClaimFreshnessFeedback({
  answer,
  claimId,
  messageId,
  question,
}: ClaimFreshnessFeedbackProps) {
  const [status, setStatus] = useState<FeedbackStatus>('idle')

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/compare/claims/feedback', {
      body: JSON.stringify({
        answer,
        claimId,
        comment: String(formData.get('comment') || '').trim(),
        messageId,
        question,
        sourceUrl: String(formData.get('sourceUrl') || '').trim(),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    setStatus(response.ok ? 'submitted' : 'error')
  }

  if (status === 'submitted') {
    return (
      <p className="mt-2 text-sm font-medium text-muted-foreground">
        Merci. Le lien de mise à jour pour la claim {claimId} a été transmis.
      </p>
    )
  }

  return (
    <div className="mt-3 rounded-xl border border-border/70 bg-secondary/40 p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Claim {claimId}</span>
        <Button
          disabled={status === 'submitting'}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => setStatus(status === 'editing' ? 'idle' : 'editing')}
        >
          <AlertTriangle aria-hidden="true" />
          Ce n’est plus à jour
        </Button>
      </div>
      {status === 'editing' || status === 'submitting' || status === 'error' ? (
        <form className="mt-3 space-y-3" onSubmit={submitFeedback}>
          <label className="block text-sm font-semibold">
            Nouveau lien source
            <input
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
              disabled={status === 'submitting'}
              name="sourceUrl"
              placeholder="https://..."
              required
              type="url"
            />
          </label>
          <label className="block text-sm font-semibold">
            Commentaire
            <textarea
              className="mt-2 min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2"
              disabled={status === 'submitting'}
              name="comment"
              placeholder="Optionnel: expliquez rapidement ce que la nouvelle source invalide."
            />
          </label>
          <Button disabled={status === 'submitting'} size="sm" type="submit">
            Envoyer le lien
          </Button>
          {status === 'error' ? (
            <p className="text-sm font-medium text-destructive">
              Le lien n’a pas pu être enregistré. Vérifiez l’URL et réessayez.
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  )
}
