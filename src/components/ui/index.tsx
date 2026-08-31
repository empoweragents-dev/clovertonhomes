'use client'

/**
 * Minimal shared primitives for the Documents module.
 *
 * The rest of the admin inlines Tailwind on every screen, which is why no two pages
 * look quite alike. The Documents module adds ~10 screens, so it gets a deliberately
 * small set of building blocks instead — six components, no new dependencies, built
 * from the existing brand tokens. Existing admin screens are left untouched.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/* ------------------------------------------------------------------ Button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-brand-teal text-white hover:opacity-90 disabled:opacity-50',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50',
    ghost: 'text-gray-600 hover:bg-gray-100 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
}

export function Button({
    variant = 'primary', size = 'md', loading = false, icon, children, className = '', ...props
}: {
    variant?: ButtonVariant
    size?: 'sm' | 'md'
    loading?: boolean
    icon?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const sizing = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm'
    return (
        <button
            {...props}
            disabled={props.disabled || loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed ${sizing} ${BUTTON_VARIANTS[variant]} ${className}`}
        >
            {loading
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : icon && <span className="material-symbols-outlined text-[18px] leading-none">{icon}</span>}
            {children}
        </button>
    )
}

/* -------------------------------------------------------------------- Card */

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
            <div>
                <h2 className="font-heading font-bold text-gray-900">{title}</h2>
                {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>
            {action}
        </div>
    )
}

/* ------------------------------------------------------------------- Field */

/**
 * Label + control + hint/error. This is the single largest copy-paste source in the
 * existing admin, so it is worth having exactly once.
 */
export function Field({
    label, hint, error, required, children, className = '',
}: {
    label: string
    hint?: string
    error?: string
    required?: boolean
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={className}>
            <label className="block text-sm font-bold text-gray-700 mb-1">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error
                ? <p className="text-xs text-red-600 mt-1">{error}</p>
                : hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
        </div>
    )
}

export const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent text-sm'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return <select {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

/* --------------------------------------------------------------- StatusPill */

const STATUS_TONES: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    internal_review: 'bg-amber-100 text-amber-800',
    ready_to_send: 'bg-blue-100 text-blue-800',
    sent: 'bg-indigo-100 text-indigo-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-700',
    expired: 'bg-orange-100 text-orange-800',
    superseded: 'bg-gray-100 text-gray-500',
    converted: 'bg-teal-100 text-teal-800',
    archived: 'bg-gray-100 text-gray-500',
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
    const tone = STATUS_TONES[status] ?? 'bg-gray-100 text-gray-700'
    const text = label ?? status.replace(/_/g, ' ')
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${tone}`}>
            {text}
        </span>
    )
}

/* ------------------------------------------------------------------- Modal */

/**
 * Defined at module level, never inside another component — the existing
 * InclusionsManagement declares its modal as an inner function, which remounts on
 * every parent render and steals input focus while typing.
 */
export function Modal({
    open, onClose, title, description, children, footer, size = 'md',
}: {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    size?: 'md' | 'lg' | 'xl'
}) {
    if (!open) return null
    const width = size === 'xl' ? 'max-w-4xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-2xl w-full ${width} max-h-[90vh] flex flex-col shadow-xl`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="font-heading font-bold text-lg text-gray-900">{title}</h3>
                        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="px-6 py-5 overflow-y-auto">{children}</div>
                {footer && <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">{footer}</div>}
            </div>
        </div>
    )
}

/* ------------------------------------------------------------------- Toast */

/**
 * Replaces alert() inside this module. Not cosmetic: autosave has to be able to say
 * "Saved 3:42 PM" without blocking the editor, which alert() cannot do.
 */
type Toast = { id: number; message: string; tone: 'success' | 'error' | 'info' }

const ToastContext = createContext<{ push: (message: string, tone?: Toast['tone']) => void }>({ push: () => { } })

export function useToast() {
    return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const push = useCallback((message: string, tone: Toast['tone'] = 'success') => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, tone }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    }, [])

    const value = useMemo(() => ({ push }), [push])

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${t.tone === 'error' ? 'bg-red-600' : t.tone === 'info' ? 'bg-gray-800' : 'bg-green-600'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {t.tone === 'error' ? 'warning' : t.tone === 'info' ? 'info' : 'check_circle'}
                        </span>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

/* ---------------------------------------------------------------- currency */

/** Cents -> "$428,000.00". Money is integer cents everywhere; never parse to float. */
export function formatMoney(cents: number | null | undefined): string {
    const value = (cents ?? 0) / 100
    return value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
}
