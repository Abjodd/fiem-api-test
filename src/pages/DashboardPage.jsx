import { useState, useMemo } from 'react'
import FilterBar from '../filterbar'
import DynamicTable from './../DynamicTable'
import { fetchDashboard, postBulkAction } from '../lib/dashboardApi'

export default function DashboardPage() {

    const [customerCode, setCustomerCode] = useState('')
    const [materialDescription, setMaterialDescription] = useState('')

    const [dateColumns, setDateColumns] = useState([])
    const [allRows, setAllRows] = useState([])

    // User1 only sees rows the bot posted with no action taken yet
    const rows = useMemo(
        () => allRows.filter(r => r.status === '' && r.approve === ''),
        [allRows]
    )

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)

    const [selectedRowIds, setSelectedRowIds] = useState(new Set())

    const [isActing, setIsActing] = useState(false)
    const [pendingAction, setPendingAction] = useState(null)
    const [actionError, setActionError] = useState(null)
    const [actionSuccess, setActionSuccess] = useState(null)

    const selectedCount = selectedRowIds.size
    const canAct = selectedCount > 0 && !isActing

    const handleGo = async () => {
        setLoading(true)
        setError(null)
        setActionError(null)
        setActionSuccess(null)
        setSelectedRowIds(new Set())
        try {
            const data = await fetchDashboard({ customerCode, materialDescription })
            setDateColumns(data.dateColumns)
            setAllRows(data.rows)
            setHasSearched(true)
        } catch (err) {
            setError(err.message || 'Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setCustomerCode('')
        setMaterialDescription('')
        setDateColumns([])
        setAllRows([])
        setHasSearched(false)
        setError(null)
        setSelectedRowIds(new Set())
        setActionError(null)
        setActionSuccess(null)
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
                customerCode={customerCode}
                onCustomerCodeChange={setCustomerCode}
                materialDescription={materialDescription}
                onMaterialDescriptionChange={setMaterialDescription}
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
                            <div className="text-[13px]">Enter a customer code and click <strong>Go</strong></div>
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
                            dateColumns={dateColumns}
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