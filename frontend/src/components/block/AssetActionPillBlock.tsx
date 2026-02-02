import React, { useMemo, useState, useRef } from 'react'
import DialogWrapper from './DialogWrapper'
import { Search, SearchIcon, ArrowRight, Package, Blocks } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import type { Hotspot } from '@/types/hotspots.service.type'
import type { Asset } from '@/types/asset.type'
import useAssetStore from '@/store/asset.store'
import { DialogClose } from '@/components/ui/dialog'

// AssetResultCard component
const AssetResultCard: React.FC<{ asset: Asset; onSelect: (asset: Asset) => void }> = ({ asset, onSelect }) => {
    return (
        <Card className="overflow-hidden shadow-lg glass glass-hover !py-0 hover:shadow-xl group-hover:!border-blue-400/50 group-hover:!bg-blue-500/20 transition-all duration-300 cursor-pointer group backdrop-blur-md border border-white/20" onClick={() => onSelect(asset)}>
            <CardContent className="!p-0 flex">
                {/* Preview Image */}
                <div className="w-36 h-32 overflow-hidden flex-shrink-0 rounded-l-lg">
                    {asset.image_url ? (
                        <img
                            src={asset.image_url}
                            alt={asset.title || 'Asset preview'}
                            className="w-full h-full md:group-hover:scale-[1.2] transition-all ease-in-out duration-150 object-cover rounded-l-xl bg-black/20"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex rounded-l-xl glass items-center justify-center backdrop-blur-sm">
                            <Package className="w-8 h-8 text-white/70" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 w-full min-w-0">
                    <div className="flex items-start h-full justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-white sm:text-base truncate">
                                {asset.title || 'Không có tiêu đề'}
                            </h3>
                        </div>

                        {/* Arrow Button */}
                        <div className="hover:animate-pulse pr-1 pt-1 flex items-center justify-center h-full">
                            <div className='w-12 p-2 md:group-hover:!text-blue-400 md:group-hover:right-[-1rem] w-auto rounded-full flex text-white/70 md:group-hover:scale-[1.5] transition-all ease-in-out duration-300 glass md:group-hover:bg-blue-500/30'>
                                <ArrowRight className="!size-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const AssetActionPillBlock = ({
    showMedia,
    hotspot
}: {
    showMedia: (mediaName: string) => void;
    hotspot: Hotspot | null
}) => {

    const [search, setSearch] = useState<string>('')
    const { setCurrentAsset } = useAssetStore(state => state)
    const dialogCloseRef = useRef<HTMLButtonElement>(null)

    const filteredAssets = useMemo(() => {
        if (!search.trim()) return hotspot?.assets || []

        const searchLower = search.toLowerCase().trim()
        return hotspot?.assets?.filter(asset =>
            asset.title?.toLowerCase().includes(searchLower)
        ) || []
    }, [search, hotspot?.assets])

    const handleSelectAsset = (asset: Asset) => {
        // Set the current asset to show in drawer
        setCurrentAsset(asset)
        // Navigate to panorama if it exists
        if (asset.panorama_id) {
            showMedia(asset.panorama_id)
        }

        // Close the search dialog
        if (dialogCloseRef.current) {
            dialogCloseRef.current.click()
        }
    }

    return (
        <DialogWrapper
            customClose={true}
            customHeader={<div>
                <div className="flex h-9 items-center gap-0 glass glass-hover border border-white/20 text-white rounded-full px-3 backdrop-blur-md shadow-lg">
                    <SearchIcon className="size-4 text-white/70 shrink-0" />
                    <Input
                        className='placeholder:text-white/50 flex h-10 w-full rounded-md bg-transparent py-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-transparent border-none !text-lg text-white'
                        placeholder='Tìm kiếm vật phẩm'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {/* Hidden close button for programmatic control */}
                <DialogClose ref={dialogCloseRef} className="hidden" />
            </div>}
            trigger={<Button
                key={"assets"}
                className="shadow-lg rounded-full glass glass-hover flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
            >
                <Blocks />
                Vật phẩm
            </Button>}
            showHeader={true}
            headerIcon={<Search className="w-5 h-5 text-primary" />}
            title="Tìm kiếm vật phẩm"
            description="Tìm kiếm vật phẩm trong không gian"
            showCloseButton={true}
            showFooter={true}
            size="lg"
            mobileSize="lg"
            useCustomScrollbar={true}

        >
            <div className="space-y-3">
                {(filteredAssets && filteredAssets.length > 0) ? (
                    filteredAssets.map((asset) => (
                        <AssetResultCard
                            key={asset.asset_id}
                            asset={asset}
                            onSelect={handleSelectAsset}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 glass glass-light rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                        <Search className="w-12 h-12 text-blue-400/90 mx-auto mb-4" />
                        <p className="text-white/80">
                            {search.trim() ? 'Không tìm thấy vật phẩm phù hợp' : 'Không có vật phẩm nào'}
                        </p>
                        {search.trim() && (
                            <p className="text-sm text-white/60 mt-2">
                                Thử tìm kiếm với từ khóa khác
                            </p>
                        )}
                    </div>
                )}
            </div>
        </DialogWrapper>
    )
}

export default AssetActionPillBlock;