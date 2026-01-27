'use client'

import { useEffect, useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Workflow, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import {
  fetchCICDConfig,
  saveCICDConfig,
  promoteAction,
} from '@/lib/cicd/cicd'

export function CICDSetupDrawer({
  open,
  onOpenChange,
  actionId,
  portalId,
  sourceCode,
}) {
  const [workflowId, setWorkflowId] = useState('')
  const [secretName, setSecretName] = useState('')
  const [token, setToken] = useState('')
  const [maskedToken, setMaskedToken] = useState('')
  const [replaceToken, setReplaceToken] = useState(false)

  const [loading, setLoading] = useState(false)
  const [pushing, setPushing] = useState(false)

  const hasExistingToken = Boolean(maskedToken)

  /* --------------------------------
     Load config on open
  -------------------------------- */

  useEffect(() => {
    if (!open) return

    setLoading(true)

    fetchCICDConfig(actionId, portalId)
      .then(config => {
        setWorkflowId(config.workflowId || '')
        setSecretName(config.secretName || '')
        setMaskedToken(
          config.token
            ? `${config.token.slice(0, 8)}••••••••`
            : ''
        )
        setToken('')
        setReplaceToken(false)
      })
      .catch(() => {
        toast.error('Failed to load CI/CD configuration')
      })
      .finally(() => setLoading(false))
  }, [open, actionId, portalId])

  /* --------------------------------
     Derived state
  -------------------------------- */

  const canSave =
    workflowId.trim() &&
    secretName.trim() &&
    (!replaceToken || token.length)

  const canPush = true
    // workflowId.trim() &&
    // secretName.trim() &&
    // hasExistingToken

  /* --------------------------------
     Actions
  -------------------------------- */

  async function handleSave() {
    setLoading(true)

    try {
      await saveCICDConfig({
        actionId,
        portalId,
        workflowId,
        secretName,
        token: replaceToken ? token : undefined,
      })

      toast.success('CI/CD configuration saved')
      setToken('')
      setReplaceToken(false)
    } catch (err) {
      toast.error('Failed to save CI/CD configuration')
    } finally {
      setLoading(false)
    }
  }

  async function handlePush() {
    setPushing(true)

    try {
      const res = await promoteAction({
        workflowId,
        secretName,
        hubspotToken: token,
        sourceCode,
      })

      if (res.status === 'noop') {
        toast.info('Workflow already up to date')
      } else {
        toast.success('Action promoted to HubSpot')
      }
    } catch (err) {
      toast.error(err.message || 'Promotion failed')
    } finally {
      setPushing(false)
    }
  }

  /* --------------------------------
     Render
  -------------------------------- */

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-3xl px-10 pb-10 pt-6">
          <DrawerHeader className="px-0">
            <DrawerTitle className="flex items-center gap-2 text-lg">
              <Workflow className="h-5 w-5 text-primary" />
              CI/CD – HubSpot Workflow
            </DrawerTitle>
            <DrawerDescription>
              Configure promotion of this action into HubSpot.
              Credentials are encrypted and never exposed.
            </DrawerDescription>
          </DrawerHeader>

          <div className="mt-6 space-y-6">
            {/* Workflow ID */}
            <div className="space-y-2">
              <Label>Workflow ID</Label>
              <Input
                disabled={loading}
                className="h-12 px-4 font-mono text-base"
                inputMode="numeric"
                placeholder="123456789"
                value={workflowId}
                onChange={e =>
                  setWorkflowId(e.target.value.replace(/\D/g, ''))
                }
              />
              <p className="text-xs text-muted-foreground">
                Numeric HubSpot workflow identifier.
              </p>
            </div>

            {/* Token */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                CI/CD HubSpot Token
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </Label>

              {hasExistingToken && !replaceToken ? (
                <div className="flex gap-2">
                  <Input
                    disabled
                    className="h-12 px-4 font-mono text-base"
                    value={maskedToken}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setReplaceToken(true)}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Input
                  type="password"
                  disabled={loading}
                  className="h-12 px-4 font-mono text-base"
                  placeholder="automation scope token"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                />
              )}

              <p className="text-xs text-muted-foreground">
                Requires <code>automation</code> scope. Stored encrypted.
              </p>
            </div>

            {/* Secret name */}
            <div className="space-y-2">
              <Label>Search Secret Name</Label>
              <Input
                disabled={loading}
                className="h-12 px-4 font-mono text-base"
                placeholder="HUBSPOT_PRIVATE_APP_TOKEN"
                value={secretName}
                onChange={e => setSecretName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Used to locate the target CUSTOM_CODE action.
              </p>
            </div>
          </div>

          <DrawerFooter className="mt-10 flex justify-between px-0">
            <Button
              variant="outline"
              disabled={!canSave || loading}
              onClick={handleSave}
            >
              Save CI/CD Setup
            </Button>

            <Button
              disabled={!canPush || pushing}
              onClick={handlePush}
            >
              {pushing ? 'Pushing…' : 'Push to HubSpot'}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
