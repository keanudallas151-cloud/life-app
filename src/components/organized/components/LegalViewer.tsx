import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Article, ShieldCheck } from '@phosphor-icons/react'

import { Card } from './ui/card'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

interface LegalViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type LegalDocument =
  | 'terms'
  | 'privacy'
  | 'cookies'
  | 'disclaimer'
  | 'acceptable-use'
  | 'data-policy'

type LegalDocConfig = {
  id: LegalDocument
  title: string
  icon: React.ElementType
  filePath: string
  fallbackContent: string
}

const FALLBACK_TERMS = `
<h1>Terms and Conditions</h1>
<p>Welcome to <strong>life.</strong> These Terms and Conditions govern your use of the app and related services.</p>

<h2>Use of the Service</h2>
<p>You agree to use the service lawfully and responsibly. You must not misuse the app, interfere with its operation, or attempt unauthorized access.</p>

<h2>Accounts</h2>
<p>If accounts are enabled, you are responsible for maintaining the confidentiality of your login details and for activity under your account.</p>

<h2>Content and Features</h2>
<p>The app may provide tools, summaries, guidance, reminders, and finance-related organization features. These are provided for general informational and productivity purposes only.</p>

<h2>Limitation of Liability</h2>
<p>We do not guarantee uninterrupted service. To the extent permitted by law, we are not liable for indirect, incidental, or consequential loss arising from your use of the app.</p>

<h2>Changes</h2>
<p>We may update these terms from time to time. Continued use of the service after changes means you accept the updated terms.</p>
`

const FALLBACK_PRIVACY = `
<h1>Privacy Notice</h1>
<p>This Privacy Notice explains how <strong>life.</strong> collects, uses, stores, and protects personal information.</p>

<h2>Information We Collect</h2>
<ul>
  <li>Account information you provide</li>
  <li>App usage data and device information</li>
  <li>Content you create inside the app</li>
</ul>

<h2>How We Use Information</h2>
<ul>
  <li>To provide and improve the app</li>
  <li>To maintain security and prevent abuse</li>
  <li>To communicate important updates</li>
</ul>

<h2>Data Storage and Security</h2>
<p>We use reasonable safeguards to protect personal information. No system is completely secure, so absolute security cannot be guaranteed.</p>

<h2>Your Rights</h2>
<p>Depending on your location, you may have rights to access, correct, delete, or export your data.</p>
`

const FALLBACK_COOKIES = `
<h1>Cookie Policy</h1>
<p>This Cookie Policy explains how cookies and similar technologies may be used on associated websites or web apps.</p>

<h2>Types of Cookies</h2>
<ul>
  <li>Essential cookies</li>
  <li>Analytics cookies</li>
  <li>Preference cookies</li>
</ul>

<h2>Your Choices</h2>
<p>You can usually control cookies through browser settings. Disabling some cookies may affect functionality.</p>
`

const FALLBACK_DISCLAIMER = `
<h1>Disclaimer</h1>
<p><strong>life.</strong> provides productivity, planning, summary, and finance-related organizational features for general informational purposes only.</p>

<h2>Not Financial Advice</h2>
<p>Nothing in the app should be treated as financial, legal, tax, medical, or other professional advice.</p>

<h2>No Guarantee</h2>
<p>We do not guarantee outcomes, financial results, or personal improvement results from use of the app.</p>
`

const FALLBACK_AUP = `
<h1>Acceptable Use Policy</h1>
<p>You must use the service lawfully, respectfully, and in a way that does not harm the platform or other users.</p>

<h2>Prohibited Uses</h2>
<ul>
  <li>Illegal activity</li>
  <li>Fraudulent behavior</li>
  <li>Security abuse or unauthorized access attempts</li>
  <li>Uploading harmful or malicious content</li>
</ul>
`

const FALLBACK_DATA_POLICY = `
<h1>Data Protection Policy</h1>
<p>We are committed to handling data responsibly and in line with applicable privacy and data protection principles.</p>

<h2>Principles</h2>
<ul>
  <li>Lawfulness and transparency</li>
  <li>Purpose limitation</li>
  <li>Data minimization</li>
  <li>Storage limitation</li>
  <li>Integrity and confidentiality</li>
</ul>
`

const LEGAL_DOCUMENTS: LegalDocConfig[] = [
  {
    id: 'terms',
    title: 'Terms & Conditions',
    icon: FileText,
    filePath: '/legal/terms.html',
    fallbackContent: FALLBACK_TERMS,
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: ShieldCheck,
    filePath: '/legal/privacy.html',
    fallbackContent: FALLBACK_PRIVACY,
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    icon: Article,
    filePath: '/legal/cookies.html',
    fallbackContent: FALLBACK_COOKIES,
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    icon: Article,
    filePath: '/legal/disclaimer.html',
    fallbackContent: FALLBACK_DISCLAIMER,
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    icon: Article,
    filePath: '/legal/acceptable-use.html',
    fallbackContent: FALLBACK_AUP,
  },
  {
    id: 'data-policy',
    title: 'Data Protection',
    icon: Article,
    filePath: '/legal/data-protection.html',
    fallbackContent: FALLBACK_DATA_POLICY,
  },
]

export function LegalViewer({
  open,
  onOpenChange,
}: LegalViewerProps) {
  const [activeDocument, setActiveDocument] = useState<LegalDocument>('terms')
  const [content, setContent] = useState<string>(FALLBACK_TERMS)
  const [loading, setLoading] = useState(false)

  const activeDoc = useMemo(
    () => LEGAL_DOCUMENTS.find((doc) => doc.id === activeDocument) ?? LEGAL_DOCUMENTS[0],
    [activeDocument]
  )

  useEffect(() => {
    if (!open) return

    let cancelled = false

    const loadDocument = async () => {
      setLoading(true)

      try {
        const response = await fetch(activeDoc.filePath)

        if (!response.ok) {
          throw new Error(`Failed to load ${activeDoc.filePath}`)
        }

        const html = await response.text()

        if (!cancelled) {
          setContent(html)
        }
      } catch {
        if (!cancelled) {
          setContent(activeDoc.fallbackContent)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadDocument()

    return () => {
      cancelled = true
    }
  }, [open, activeDoc])

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onOpenChange(false)
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="flex w-full max-w-6xl flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-background shadow-2xl my-4"
          style={{ height: 'min(90vh, 800px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Legal Documents</h2>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Review terms, privacy, and related policies
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Close legal viewer"
              type="button"
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          <Tabs
            value={activeDocument}
            onValueChange={(value) => setActiveDocument(value as LegalDocument)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="border-b border-border px-4 pt-4 overflow-x-auto">
              <TabsList className="grid h-auto min-w-max grid-cols-2 gap-2 bg-transparent md:grid-cols-3 xl:grid-cols-6">
                {LEGAL_DOCUMENTS.map((doc) => {
                  const Icon = doc.icon

                  return (
                    <TabsTrigger
                      key={doc.id}
                      value={doc.id}
                      className="flex h-auto flex-col gap-2 rounded-xl border border-border px-3 py-3 data-[state=active]:border-primary"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden text-xs sm:inline">{doc.title}</span>
                      <span className="text-[10px] leading-tight whitespace-nowrap sm:hidden">
                        {doc.title.split(' ')[0]}
                      </span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6 pt-4">
              <AnimatePresence mode="wait">
                {LEGAL_DOCUMENTS.map((doc) => (
                  <TabsContent
                    key={doc.id}
                    value={doc.id}
                    className="h-full m-0 data-[state=inactive]:hidden"
                  >
                    <Card className="h-full overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 sm:p-6 md:p-8">
                          {loading && doc.id === activeDocument ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="flex flex-col items-center gap-3">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: 'linear',
                                  }}
                                  className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
                                />
                                <p className="text-sm text-muted-foreground">
                                  Loading document...
                                </p>
                              </div>
                            </div>
                          ) : (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="prose prose-sm max-w-none dark:prose-invert md:prose-base
                                prose-headings:font-bold prose-headings:tracking-tight
                                prose-h1:mb-4 prose-h1:text-2xl sm:prose-h1:text-3xl
                                prose-h2:mt-6 sm:prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl sm:prose-h2:text-2xl
                                prose-h3:mt-4 sm:prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-lg sm:prose-h3:text-xl
                                prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-foreground prose-strong:font-semibold
                                prose-ul:my-3 sm:prose-ul:my-4 prose-li:my-1 prose-li:text-sm sm:prose-li:text-base
                                prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary
                                prose-pre:border prose-pre:border-border prose-pre:bg-muted"
                              dangerouslySetInnerHTML={{
                                __html: doc.id === activeDocument ? content : doc.fallbackContent,
                              }}
                            />
                          )}
                        </div>
                      </ScrollArea>
                    </Card>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </div>
          </Tabs>

          <div className="border-t border-border bg-muted/20 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <p className="hidden sm:block">life. - Your Guide to Better Living</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}