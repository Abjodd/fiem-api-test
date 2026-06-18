import { Input } from './input'
import { Button } from './button'

export default function FilterBar({
    customerCode,
    onCustomerCodeChange,
    materialDescription,
    onMaterialDescriptionChange,
    onGo,
    onClear,
    loading,

    selectedCount,
    canAct,
    isActing,
    pendingAction,

    onApprove,
    onReject,

    actionError,
    actionSuccess,
}) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onGo()
    }

    const countLabel = selectedCount ? ` (${selectedCount})` : ''

    return (
        <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-[#e5e5e5] flex-shrink-0">
            <div className="flex flex-wrap items-end gap-3">

                <div className="w-full sm:w-auto sm:min-w-[220px]">
                    <label className="block text-[12px] text-[#6a6d70] mb-1 font-semibold">
                        Customer Code <span className="text-[#cc1c14]">*</span>
                    </label>
                    <Input
                        value={customerCode}
                        onChange={(e) => onCustomerCodeChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter customer code"
                        className="h-10 text-[13px]"
                    />
                </div>

                <div className="w-full sm:w-auto sm:min-w-[260px]">
                    <label className="block text-[12px] text-[#6a6d70] mb-1 font-semibold">
                        Material Description
                    </label>
                    <Input
                        value={materialDescription}
                        onChange={(e) => onMaterialDescriptionChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter material description"
                        className="h-10 text-[13px]"
                    />
                </div>

                <div className="flex items-center gap-2 ml-auto flex-wrap">

                    <Button
                        onClick={onGo}
                        disabled={loading || isActing || !customerCode.trim()}
                        className="h-10 bg-[#0a6ed1] hover:bg-[#085caf] text-white"
                    >
                        {loading ? 'Loading…' : 'Go'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClear}
                        disabled={loading || isActing}
                        className="h-10"
                    >
                        Clear
                    </Button>

                    <div className="w-px h-9 bg-[#e5e5e5] mx-1" />

                    {/* Approve */}
                    <button
                        type="button"
                        onClick={onApprove}
                        disabled={!canAct || (isActing && pendingAction !== 'A')}
                        className={`flex items-center gap-1.5 px-4 h-10 text-[13px] font-semibold rounded-lg transition-all ${
                            canAct
                                ? 'text-white bg-[#107e3e] hover:bg-[#0c632f]'
                                : 'text-[#a8aaac] bg-[#e5e5e5] cursor-not-allowed'
                        }`}
                    >
                        {isActing && pendingAction === 'A' ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Approving…
                            </>
                        ) : (
                            <>
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                                Approve{countLabel}
                            </>
                        )}
                    </button>

                    {/* Reject */}
                    <button
                        type="button"
                        onClick={onReject}
                        disabled={!canAct || (isActing && pendingAction !== 'R')}
                        className={`flex items-center gap-1.5 px-4 h-10 text-[13px] font-semibold rounded-lg transition-all ${
                            canAct
                                ? 'text-white bg-[#cc1c14] hover:bg-[#a8160f]'
                                : 'text-[#a8aaac] bg-[#e5e5e5] cursor-not-allowed'
                        }`}
                    >
                        {isActing && pendingAction === 'R' ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Rejecting…
                            </>
                        ) : (
                            <>
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                                Reject{countLabel}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {actionSuccess && !actionError && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#107e3e]">
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12l3 3 5-6" />
                    </svg>
                    {actionSuccess}
                </div>
            )}

            {actionError && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#cc1c14]">
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" />
                    </svg>
                    {actionError}
                </div>
            )}
        </div>
    )
}