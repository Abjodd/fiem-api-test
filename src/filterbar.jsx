import { useState, useMemo, useEffect } from 'react'
import { Button } from './button'

// ── Multi-select Value Help Modal ─────────────────────────────
function ValueHelpModal({ title, options, selected, onToggle, onDone, onCancel }) {
    const [search, setSearch] = useState('')

    const filtered = useMemo(() => {
        if (!search) return options
        const q = search.toLowerCase()
        return options.filter(o =>
            o.code.toLowerCase().includes(q) || (o.label && o.label.toLowerCase().includes(q))
        )
    }, [options, search])

    useEffect(() => {
        const h = e => { if (e.key === 'Escape') onCancel() }
        document.addEventListener('keydown', h)
        return () => document.removeEventListener('keydown', h)
    }, [onCancel])

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <div className="bg-white rounded-xl shadow-2xl w-[380px] max-w-[95vw] flex flex-col overflow-hidden"
                style={{ maxHeight: '70vh', animation: 'modalIn 0.2s ease-out both' }}>
                <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold text-[#32363a]">{title}</h3>
                    {selected.length > 0 && (
                        <span className="text-[11px] font-semibold text-white bg-[#0a6ed1] rounded-full px-2 py-0.5">
                            {selected.length} selected
                        </span>
                    )}
                </div>
                <div className="px-4 py-3 border-b border-[#e5e5e5]">
                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search"
                            className="w-full h-9 pl-3 pr-9 text-[13px] border border-[#d9d9d9] rounded-lg focus:outline-none focus:border-[#0a6ed1] focus:ring-2 focus:ring-[#0a6ed1]/20 transition-all"
                        />
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            className="absolute right-3 top-2.5 text-[#6a6d70]">
                            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
                        </svg>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0">
                    {filtered.length === 0
                        ? <div className="py-10 text-center text-[13px] text-[#6a6d70]">No results found</div>
                        : filtered.map(opt => {
                            const isSelected = selected.includes(opt.code)
                            return (
                                <button key={opt.code} onClick={() => onToggle(opt.code)}
                                    className={`w-full text-left px-5 py-3 border-b border-[#f0f0f0] last:border-b-0 flex items-center gap-3 transition-colors ${
                                        isSelected ? 'bg-[#ebf5ff]' : 'hover:bg-[#f5f6f7]'
                                    }`}>
                                    <div className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-[#0a6ed1] border-[#0a6ed1]' : 'border-[#d9d9d9]'
                                    }`}>
                                        {isSelected && (
                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                <path d="M20 6 9 17l-5-5"/>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[13px] font-semibold text-[#0a6ed1] truncate">{opt.code}</div>
                                        {opt.label && <div className="text-[11px] text-[#6a6d70] mt-0.5 truncate">{opt.label}</div>}
                                    </div>
                                </button>
                            )
                        })
                    }
                </div>
                <div className="px-5 py-3 border-t border-[#e5e5e5] flex justify-between items-center">
                    <button onClick={onCancel}
                        className="px-4 h-9 text-[13px] font-semibold text-[#6a6d70] hover:bg-[#f5f6f7] rounded-lg transition-all">
                        Cancel
                    </button>
                    <button onClick={onDone}
                        className="px-5 h-9 text-[13px] font-semibold text-white bg-[#0a6ed1] hover:bg-[#085caf] rounded-lg transition-all">
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Multi-select VhInput — shows tags ─────────────────────────
function VhInput({ placeholder, values, onOpen, onRemove }) {
    return (
        <div className="min-h-[40px] border border-[#d9d9d9] rounded-lg bg-white focus-within:border-[#0a6ed1] focus-within:ring-2 focus-within:ring-[#0a6ed1]/20 transition-all flex flex-wrap gap-1.5 p-1.5 items-center cursor-pointer"
            onClick={onOpen}>
            {values.length === 0 ? (
                <span className="text-[#94a3b8] text-[13px] px-1.5 py-0.5 select-none">{placeholder}</span>
            ) : (
                values.map(v => (
                    <span key={v}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ebf5ff] border border-[#c0daf7] rounded-md text-[12px] font-semibold text-[#0a6ed1]">
                        {v}
                        <button type="button"
                            onClick={e => { e.stopPropagation(); onRemove(v) }}
                            className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-[#0a6ed1] hover:text-white text-[#6a6d70] transition-all">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M18 6 6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </span>
                ))
            )}
            {/* picker icon */}
            <div className="ml-auto flex-shrink-0 w-7 h-7 flex items-center justify-center text-[#6a6d70] hover:text-[#0a6ed1]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
            </div>
        </div>
    )
}

// ── FilterBar ─────────────────────────────────────────────────
export default function FilterBar({
    // F4 filter values — now arrays
    kunnr, onKunnrChange,
    vbeln, onVbelnChange,
    matnr, onMatnrChange,
    werks, onWerksChange,

    // Date range (frontend filter)
    dateFrom, onDateFromChange,
    dateTo,   onDateToChange,

    // VH modal state
    vhModal, vhOptions, onOpenVh, onVhSelect, onVhCancel,

    // Actions
    onGo, onClear, loading,

    selectedCount, canAct, isActing, pendingAction,
    onApprove, onReject,
    actionError, actionSuccess,
}) {
    const countLabel = selectedCount ? ` (${selectedCount})` : ''

    const dateError = useMemo(() => {
        if (!dateFrom || !dateTo) return null
        return new Date(dateFrom) > new Date(dateTo) ? 'From date must be before To date' : null
    }, [dateFrom, dateTo])

    const VH_TITLES = {
        kunnr: 'Customer',
        vbeln: 'Sales Document',
        matnr: 'Material',
        werks: 'Plant',
    }

    // Map field → current array of selected codes
    const fieldValues = { kunnr, vbeln, matnr, werks }
    const fieldSetters = { kunnr: onKunnrChange, vbeln: onVbelnChange, matnr: onMatnrChange, werks: onWerksChange }

    const handleToggle = (code) => {
        const current = fieldValues[vhModal] ?? []
        const next = current.includes(code)
            ? current.filter(c => c !== code)
            : [...current, code]
        fieldSetters[vhModal]?.(next)
    }

    const handleRemove = (field, code) => {
        fieldSetters[field]?.((fieldValues[field] ?? []).filter(c => c !== code))
    }

    return (
        <>
            <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }`}</style>

            {vhModal && (
                <ValueHelpModal
                    title={VH_TITLES[vhModal]}
                    options={vhOptions}
                    selected={fieldValues[vhModal] ?? []}
                    onToggle={handleToggle}
                    onDone={onVhCancel}
                    onCancel={onVhCancel}
                />
            )}

            <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-[#e5e5e5] flex-shrink-0">

                {/* Row 1: F4 filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div>
                        <label className="block text-[12px] text-[#6a6d70] mb-1 font-semibold">
                            Customer <span className="text-[#cc1c14]">*</span>
                        </label>
                        <VhInput
                            placeholder="Select Customer"
                            values={kunnr}
                            onOpen={() => onOpenVh('kunnr')}
                            onRemove={code => handleRemove('kunnr', code)}
                        />
                    </div>
                    <div>
                        <label className="block text-[12px] text-[#6a6d70] mb-1 font-semibold">Sales Document</label>
                        <VhInput
                            placeholder="Select Sales Document"
                            values={vbeln}
                            onOpen={() => onOpenVh('vbeln')}
                            onRemove={code => handleRemove('vbeln', code)}
                        />
                    </div>
                    <div>
                        <label className="block text-[12px] text-[#6a6d70] mb-1 font-semibold">Material</label>
                        <VhInput
                            placeholder="Select Material"
                            values={matnr}
                            onOpen={() => onOpenVh('matnr')}
                            onRemove={code => handleRemove('matnr', code)}
                        />
                    </div>
                    <div>
                        <label className="block text-[12px] text-[#6a6d70] mb-1 font-semibold">Plant</label>
                        <VhInput
                            placeholder="Select Plant"
                            values={werks}
                            onOpen={() => onOpenVh('werks')}
                            onRemove={code => handleRemove('werks', code)}
                        />
                    </div>
                </div>

                {/* Row 2: Date range + action buttons */}
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-[12px] text-[#6a6d70] mb-1 font-semibold">Date From</label>
                        <div className="relative">
                            <input type="date" value={dateFrom}
                                onChange={e => onDateFromChange(e.target.value)}
                                max={dateTo || undefined}
                                className={`h-10 pl-3 pr-8 text-[13px] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                                    dateError ? 'border-[#cc1c14] focus:ring-[#cc1c14]/20' : 'border-[#d9d9d9] focus:border-[#0a6ed1] focus:ring-[#0a6ed1]/20'
                                }`} />
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                className="absolute right-2.5 top-3.5 text-[#6a6d70] pointer-events-none">
                                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[12px] text-[#6a6d70] mb-1 font-semibold">Date To</label>
                        <div className="relative">
                            <input type="date" value={dateTo}
                                onChange={e => onDateToChange(e.target.value)}
                                min={dateFrom || undefined}
                                className={`h-10 pl-3 pr-8 text-[13px] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                                    dateError ? 'border-[#cc1c14] focus:ring-[#cc1c14]/20' : 'border-[#d9d9d9] focus:border-[#0a6ed1] focus:ring-[#0a6ed1]/20'
                                }`} />
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                className="absolute right-2.5 top-3.5 text-[#6a6d70] pointer-events-none">
                                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto flex-wrap">
                        <Button
                            onClick={onGo}
                            disabled={loading || isActing || kunnr.length === 0 || !!dateError}
                            className="h-10 bg-[#0a6ed1] hover:bg-[#085caf] text-white"
                        >
                            {loading ? 'Loading…' : 'Go'}
                        </Button>

                        <Button type="button" variant="outline" onClick={onClear}
                            disabled={loading || isActing} className="h-10">
                            Clear
                        </Button>

                        <div className="w-px h-9 bg-[#e5e5e5] mx-1" />

                        {/* Approve */}
                        <button type="button" onClick={onApprove}
                            disabled={!canAct || (isActing && pendingAction !== 'A')}
                            className={`flex items-center gap-1.5 px-4 h-10 text-[13px] font-semibold rounded-lg transition-all ${
                                canAct ? 'text-white bg-[#107e3e] hover:bg-[#0c632f]' : 'text-[#a8aaac] bg-[#e5e5e5] cursor-not-allowed'
                            }`}>
                            {isActing && pendingAction === 'A' ? (
                                <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Approving…</>
                            ) : (
                                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>Approve{countLabel}</>
                            )}
                        </button>

                        {/* Reject */}
                        <button type="button" onClick={onReject}
                            disabled={!canAct || (isActing && pendingAction !== 'R')}
                            className={`flex items-center gap-1.5 px-4 h-10 text-[13px] font-semibold rounded-lg transition-all ${
                                canAct ? 'text-white bg-[#cc1c14] hover:bg-[#a8160f]' : 'text-[#a8aaac] bg-[#e5e5e5] cursor-not-allowed'
                            }`}>
                            {isActing && pendingAction === 'R' ? (
                                <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Rejecting…</>
                            ) : (
                                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>Reject{countLabel}</>
                            )}
                        </button>
                    </div>
                </div>

                {dateError && (
                    <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#cc1c14]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                        {dateError}
                    </div>
                )}
                {actionSuccess && !actionError && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#107e3e]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>
                        {actionSuccess}
                    </div>
                )}
                {actionError && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#cc1c14]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                        {actionError}
                    </div>
                )}
            </div>
        </>
    )
}