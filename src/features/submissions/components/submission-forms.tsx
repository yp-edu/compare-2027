'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'

type CandidateOption = {
  id: number
  displayName: string
}

type SubmissionStatus = 'idle' | 'submitting' | 'submitted' | 'error'

type SubmissionFormsProps = {
  candidates: CandidateOption[]
}

const sourceTypes = [
  { label: 'Programme officiel', value: 'official_program' },
  { label: 'Discours', value: 'speech' },
  { label: 'Interview', value: 'interview' },
  { label: 'Communiqué', value: 'press_release' },
  { label: 'Post public', value: 'social_post' },
  { label: 'Vote', value: 'vote' },
  { label: 'Article', value: 'article' },
  { label: 'Rapport', value: 'report' },
  { label: 'Autre', value: 'other' },
]

const platforms = [
  { label: 'Site candidat/parti', value: 'party_site' },
  { label: 'X', value: 'x' },
  { label: 'Assemblée nationale', value: 'assemblee' },
  { label: 'Datan', value: 'datan' },
  { label: 'Presse', value: 'press' },
  { label: 'Institution', value: 'institution' },
  { label: 'Autre', value: 'other' },
]

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim()
}

export function SubmissionForms({ candidates }: SubmissionFormsProps) {
  const { data: session, isPending } = authClient.useSession()
  const [sourceStatus, setSourceStatus] = useState<SubmissionStatus>('idle')
  const [candidateStatus, setCandidateStatus] = useState<SubmissionStatus>('idle')
  const [sourceError, setSourceError] = useState('')
  const [candidateError, setCandidateError] = useState('')
  const isAuthenticated = Boolean(session?.user)
  const isDisabled = isPending || !isAuthenticated

  async function submitSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSourceStatus('submitting')
    setSourceError('')

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/contribuer/source', {
      body: JSON.stringify({
        candidateId: getFormValue(formData, 'candidateId'),
        platform: getFormValue(formData, 'platform'),
        publisher: getFormValue(formData, 'publisher'),
        title: getFormValue(formData, 'title'),
        type: getFormValue(formData, 'type'),
        url: getFormValue(formData, 'url'),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      setSourceStatus('error')
      setSourceError('La source n’a pas pu être envoyée. Vérifiez le lien et le candidat choisi.')
      return
    }

    event.currentTarget.reset()
    setSourceStatus('submitted')
  }

  async function submitCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCandidateStatus('submitting')
    setCandidateError('')

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/contribuer/candidate', {
      body: JSON.stringify({
        candidateDetails: getFormValue(formData, 'candidateDetails'),
        candidateName: getFormValue(formData, 'candidateName'),
        declarationUrl: getFormValue(formData, 'declarationUrl'),
        matchedCandidate: getFormValue(formData, 'matchedCandidate'),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      setCandidateStatus('error')
      setCandidateError('La suggestion n’a pas pu être envoyée. Vérifiez le nom et le lien source.')
      return
    }

    event.currentTarget.reset()
    setCandidateStatus('submitted')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {!isAuthenticated && !isPending ? (
        <Card className="border-primary/20 bg-primary/5 lg:col-span-2">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="leading-7 text-muted-foreground">
              Connectez-vous pour proposer une source ou signaler une déclaration de candidature.
            </p>
            <Button asChild>
              <Link href="/signin?next=/contribuer">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="bg-card/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Proposer une source</CardTitle>
          <CardDescription>
            Ajoutez un lien public relié à un candidat. La source sera analysée puis relue avant
            publication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submitSource}>
            <label className="block text-sm font-semibold">
              Candidat
              <select
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                disabled={isDisabled || sourceStatus === 'submitting'}
                name="candidateId"
                required
              >
                <option value="">Choisir un candidat</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              URL de la source
              <input
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                disabled={isDisabled || sourceStatus === 'submitting'}
                name="url"
                placeholder="https://..."
                required
                type="url"
              />
            </label>
            <label className="block text-sm font-semibold">
              Titre ou contexte court
              <input
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                disabled={isDisabled || sourceStatus === 'submitting'}
                name="title"
                placeholder="Ex. Interview sur la santé"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Type
                <select
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                  defaultValue="other"
                  disabled={isDisabled || sourceStatus === 'submitting'}
                  name="type"
                >
                  {sourceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Plateforme
                <select
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                  defaultValue="other"
                  disabled={isDisabled || sourceStatus === 'submitting'}
                  name="platform"
                >
                  {platforms.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Éditeur ou média
              <input
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                disabled={isDisabled || sourceStatus === 'submitting'}
                name="publisher"
                placeholder="Optionnel"
              />
            </label>
            <Button disabled={isDisabled || sourceStatus === 'submitting'} type="submit">
              Envoyer la source
            </Button>
            {sourceStatus === 'submitted' ? (
              <p className="text-sm font-medium text-muted-foreground">
                Merci. La source a été enregistrée pour analyse et modération.
              </p>
            ) : null}
            {sourceStatus === 'error' ? (
              <p className="text-sm font-medium text-destructive">{sourceError}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Signaler une candidature</CardTitle>
          <CardDescription>
            Indiquez qu’une personne a déclaré sa candidature, avec le lien qui le prouve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submitCandidate}>
            <label className="block text-sm font-semibold">
              Nom du candidat ou de la candidate
              <input
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                disabled={isDisabled || candidateStatus === 'submitting'}
                name="candidateName"
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              Source de déclaration
              <input
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                disabled={isDisabled || candidateStatus === 'submitting'}
                name="declarationUrl"
                placeholder="https://..."
                required
                type="url"
              />
            </label>
            <label className="block text-sm font-semibold">
              Candidat déjà présent, si applicable
              <select
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2"
                disabled={isDisabled || candidateStatus === 'submitting'}
                name="matchedCandidate"
              >
                <option value="">Nouvelle personne ou non renseigné</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Contexte utile
              <textarea
                className="mt-2 min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2"
                disabled={isDisabled || candidateStatus === 'submitting'}
                name="candidateDetails"
                placeholder="Optionnel: parti, rôle actuel, contexte de l’annonce..."
              />
            </label>
            <Button disabled={isDisabled || candidateStatus === 'submitting'} type="submit">
              Envoyer la suggestion
            </Button>
            {candidateStatus === 'submitted' ? (
              <p className="text-sm font-medium text-muted-foreground">
                Merci. La candidature proposée a été transmise à l’équipe éditoriale.
              </p>
            ) : null}
            {candidateStatus === 'error' ? (
              <p className="text-sm font-medium text-destructive">{candidateError}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
