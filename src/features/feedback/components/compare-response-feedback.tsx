'use client'

import { track } from '@vercel/analytics'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

type FeedbackRating = 'helpful' | 'not_helpful'
type FeedbackStatus = 'idle' | 'submitting' | 'submitted' | 'error'

type CompareResponseFeedbackProps = {
  answer: string
  messageId: string
  question: string
}

const ratingLabels: Record<FeedbackRating, string> = {
  helpful: 'Réponse utile',
  not_helpful: 'Réponse à améliorer',
}

export function CompareResponseFeedback({
  answer,
  messageId,
  question,
}: CompareResponseFeedbackProps) {
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [selectedRating, setSelectedRating] = useState<FeedbackRating | null>(null)

  async function submitFeedback(rating: FeedbackRating) {
    if (status === 'submitting' || status === 'submitted') {
      return
    }

    setStatus('submitting')
    setSelectedRating(rating)

    let response: Response

    try {
      response = await fetch('/compare/feedback', {
        body: JSON.stringify({ answer, messageId, question, rating }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
    } catch {
      setStatus('error')
      return
    }

    if (!response.ok) {
      setStatus('error')
      return
    }

    track('Compare Response Feedback', { rating }, { flags: ['compare-response-feedback'] })
    setStatus('submitted')
  }

  return (
    <div className="mt-4 border-t border-border/70 pt-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>Cette réponse vous aide-t-elle ?</span>
        <Button
          aria-pressed={selectedRating === 'helpful'}
          disabled={status === 'submitting' || status === 'submitted'}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => submitFeedback('helpful')}
        >
          <ThumbsUp aria-hidden="true" />
          Utile
        </Button>
        <Button
          aria-pressed={selectedRating === 'not_helpful'}
          disabled={status === 'submitting' || status === 'submitted'}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => submitFeedback('not_helpful')}
        >
          <ThumbsDown aria-hidden="true" />À améliorer
        </Button>
      </div>
      {status === 'submitted' && selectedRating ? (
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Merci, votre retour “{ratingLabels[selectedRating]}” a été enregistré.
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="mt-2 text-sm font-medium text-destructive">
          Le retour n’a pas pu être enregistré. Réessayez plus tard.
        </p>
      ) : null}
    </div>
  )
}
