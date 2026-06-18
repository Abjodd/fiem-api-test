import { useState, useMemo } from 'react'
import FilterBar from '../filterbar'
import DynamicTable from './../DynamicTable'
import { fetchDashboard, postBulkAction, fetchCustomerF4, fetchSalesDocF4, fetchMaterialF4, fetchPlantF4 } from '../lib/dashboardApi'

const todayIso = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DashboardPage() {

    // ── F4 filter values ──
    const [kunnr, setKunnr] = useState('')
    const [vbeln, setVbeln] = useState('')
    const [matnr, setMatnr] = useState('')
    const [werks, setWerks] = useState('')

    // ── Date range (frontend filter only) ──
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo,   setDateTo]   = useState(todayIso())

    // ── Value help modal ──
    const [vhModal,   setVhModal]   = useState(null)   // 'kunnr' | 'vbeln' | 'matnr' | 'werks' | null
    const [vhOptions, setVhOptions] = useState([])

    // ── Data ──
    const [dateColumns, setDateColumns] = useState([])
    const [allRows, setAllRows] = useState([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)

    const [selectedRowIds, setSelectedRowIds] = useState(new Set())

    const [isActing, setIsActing] = useState(false)
    const [pendingAction, setPendingAction] = useState(null)
    const [actionError, setActionError] = useState(null)
    const [actionSuccess, setActionSuccess] = useState(null)

    // ── Derived rows: User1 visibility + date range client-side filter ──
    const rows = useMemo(() => {
        let filtered = allRows.filter(r => r.status === '' && r.approve === '')

        // Date range filter: keep rows that have at least one dateLines entry within range
        if (dateFrom || dateTo) {
            filtered = filtered.filter(r => {
                return Object.keys(r.dateLines).some(dateKey => {
                    if (dateFrom && dateKey < dateFrom) return false
                    if (dateTo   && dateKey > dateTo)   return false
                    return true
                })
            })
        }

        return filtered
    }, [allRows, dateFrom, dateTo])

    // ── Filtered dateColumns: only show columns within the date range ──
    const visibleDateColumns = useMemo(() => {
        if (!dateFrom && !dateTo) return dateColumns
        return dateColumns.filter(col => {
            if (dateFrom && col.key < dateFrom) return false
            if (dateTo   && col.key > dateTo)   return false
            return true
        })
    }, [dateColumns, dateFrom, dateTo])

    const selectedCount = selectedRowIds.size
    const canAct = selectedCount > 0 && !isActing

    // ── Open VH modal ──
    const handleOpenVh = async (field) => {
        setVhModal(field)
        setVhOptions([])
        try {
            let opts = []
            switch (field) {
                case 'kunnr': opts = await fetchCustomerF4();  break
                case 'vbeln': opts = await fetchSalesDocF4();  break
                case 'matnr': opts = await fetchMaterialF4();  break
                case 'werks': opts = await fetchPlantF4();     break
                default:      opts = []
            }
            setVhOptions(opts)
        } catch {
            setVhOptions([])
        }
    }

    const handleVhSelect = (opt) => {
        const setters = { kunnr: setKunnr, vbeln: setVbeln, matnr: setMatnr, werks: setWerks }
        setters[vhModal]?.(opt.code)
        setVhModal(null)
    }

    const handleVhCancel = () => setVhModal(null)

    // ── Go ──
    const handleGo = async () => {
        setLoading(true)
        setError(null)
        setActionError(null)
        setActionSuccess(null)
        setSelectedRowIds(new Set())
        try {
            const data = await fetchDashboard({ kunnr, vbeln, matnr, werks })
            setDateColumns(data.dateColumns)
            setAllRows(data.rows)
            setHasSearched(true)
        } catch (err) {
            setError(err.message || 'Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    // ── Clear ──
    const handleClear = () => {
        setKunnr(''); setVbeln(''); setMatnr(''); setWerks('')
        setDateFrom(''); setDateTo(todayIso())
        setDateColumns([]); setAllRows([])
        setHasSearched(false); setError(null)
        setSelectedRowIds(new Set())
        setActionError(null); setActionSuccess(null)
    }

    const handleToggleRow = (rowId) => {
        setActionError(null)
        setActionSuccess(null)
        setSelectedRowIds((prev) => {
            const next = new Set(prev)
            next.has(rowId) ? next.delete(rowId) : next.add(rowId)
            return next
        })
    }

    const handleToggleAll = () => {
        setActionError(null)
        setActionSuccess(null)
        const selectableIds = rows.map(r => r.id)
        const allSelected = selectableIds.every(id => selectedRowIds.has(id))
        setSelectedRowIds(allSelected ? new Set() : new Set(selectableIds))
    }

    const handleBulkAction = async (action) => {
        const targetRows = rows.filter(r => selectedRowIds.has(r.id))
        if (!targetRows.length) return

        setActionError(null)
        setActionSuccess(null)
        setIsActing(true)
        setPendingAction(action)

        try {
            await postBulkAction({ rows: targetRows, action, editValues: {} })

            const actedIds = new Set(targetRows.map(r => r.id))
            setAllRows(prev => prev.filter(r => !actedIds.has(r.id)))
            setSelectedRowIds(prev => { const n = new Set(prev); actedIds.forEach(id => n.delete(id)); return n })

            setActionSuccess(
                `${targetRows.length} row${targetRows.length > 1 ? 's' : ''} ${action === 'A' ? 'approved' : 'rejected'} successfully.`
            )
        } catch (err) {
            setActionError(err.message || 'Action failed — please try again.')
        } finally {
            setIsActing(false)
            setPendingAction(null)
        }
    }

    return (
        <main className="flex flex-col bg-white flex-1">
            <FilterBar
                kunnr={kunnr} onKunnrChange={setKunnr}
                vbeln={vbeln} onVbelnChange={setVbeln}
                matnr={matnr} onMatnrChange={setMatnr}
                werks={werks} onWerksChange={setWerks}

                dateFrom={dateFrom} onDateFromChange={setDateFrom}
                dateTo={dateTo}     onDateToChange={setDateTo}

                vhModal={vhModal}
                vhOptions={vhOptions}
                onOpenVh={handleOpenVh}
                onVhSelect={handleVhSelect}
                onVhCancel={handleVhCancel}

                onGo={handleGo}
                onClear={handleClear}
                loading={loading}

                selectedCount={selectedCount}
                canAct={canAct}
                isActing={isActing}
                pendingAction={pendingAction}

                onApprove={() => handleBulkAction('A')}
                onReject={() => handleBulkAction('R')}

                actionError={actionError}
                actionSuccess={actionSuccess}
            />

            <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-10 pt-3 pb-6 min-h-0">
                {!hasSearched && !loading ? (
                    <div className="flex-1 flex items-center justify-center text-center text-[#6a6d70]">
                        <div>
                            <div className="text-[15px] font-semibold mb-1">No data loaded</div>
                            <div className="text-[13px]">Select a customer and click <strong>Go</strong></div>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex-1 flex items-center justify-center gap-3 text-[#6a6d70]">
                        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#0a6ed1] rounded-full animate-spin" />
                        <span className="text-[14px]">Fetching data…</span>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="px-4 py-3 bg-[#fce8e6] text-[#cc1c14] rounded-lg text-[13px]">{error}</div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col flex-1" style={{ minHeight: 0 }}>
                        <DynamicTable
                            dateColumns={visibleDateColumns}
                            rows={rows}
                            selectedRowIds={selectedRowIds}
                            onToggleRow={handleToggleRow}
                            onToggleAll={handleToggleAll}
                        />
                    </div>
                )}
            </div>
        </main>
    )
}
