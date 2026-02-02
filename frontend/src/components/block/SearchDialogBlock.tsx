import React, { useMemo, useRef } from 'react'
import DialogWrapper from './DialogWrapper'
import { Search, SearchIcon, ArrowRight, MapPin } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import useVRStore from '@/store/vr.store'
import { useState } from 'react'
import type { Hotspot } from '@/types/hotspots.service.type'

// SearchResultCard component
const SearchResultCard: React.FC<{ hotspot: Hotspot; onSelect: (hotspot: Hotspot) => void }> = ({ hotspot, onSelect }) => {
    return (
        <Card className="overflow-hidden shadow-lg glass glass-hover !py-0 hover:shadow-xl group-hover:!border-blue-400/50 group-hover:!bg-blue-500/20 transition-all duration-300 cursor-pointer group backdrop-blur-md border border-white/20" onClick={() => onSelect(hotspot)}>
            <CardContent className="!p-0 flex">
                {/* Preview Image */}
                <div className="w-36 h-32 overflow-hidden flex-shrink-0 rounded-l-lg">
                    {hotspot.preview_image ? (
                        <img
                            src={hotspot.preview_image}
                            alt={hotspot.title || 'Hotspot preview'}
                            className="w-full h-full md:group-hover:scale-[1.2] transition-all ease-in-out duration-150 object-cover rounded-l-xl"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex rounded-l-xl glass items-center justify-center backdrop-blur-sm">
                            <MapPin className="w-8 h-8 text-white/70" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 w-full min-w-0">
                    <div className="flex items-start  h-full justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-white sm:text-base truncate ">
                                {hotspot.title || 'Không có tiêu đề'}
                            </h3>
                            {hotspot.description && (
                                <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">
                                    {hotspot.description}
                                </p>
                            )}
                            {hotspot.address && (
                                <div className="flex items-center mt-2 text-xs text-gray-400">
                                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{hotspot.address}</span>
                                </div>
                            )}



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

const SearchDialogBlock = ({
    showMedia
}: {
    showMedia: (mediaName: string) => void;
}) => {

    const { areaHotspots } = useVRStore((state) => state)
    const [search, setSearch] = useState<string>('')
    const buttonRef = useRef<HTMLButtonElement>(null)

    const triggerClick = () => {
        if (buttonRef.current) {
            buttonRef.current.click()
        }
    }

    const filteredHotspots = useMemo(() => {
        if (!search.trim()) return areaHotspots

        const searchLower = search.toLowerCase().trim()
        return areaHotspots.filter(hotspot =>
            hotspot.title?.toLowerCase().includes(searchLower) ||
            hotspot.description?.toLowerCase().includes(searchLower) ||
            hotspot.address?.toLowerCase().includes(searchLower)
        )
    }, [search])

    const handleSelectHotspot = (hotspot: Hotspot) => {
        showMedia(hotspot.click_panorama_id || '')
        triggerClick()
    }



    return (
        <DialogWrapper
            customClose={true}
            customHeader={<div>
                <div className="flex h-9 items-center gap-0 glass glass-hover border border-white/20 text-white rounded-full px-3 backdrop-blur-md shadow-lg">
                    <SearchIcon className="size-4 text-white/70 shrink-0" />
                    <Input
                        className='placeholder:text-white/50 flex h-10 w-full rounded-md bg-transparent py-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-transparent border-none !text-lg text-white'
                        placeholder='Tìm kiếm địa điểm'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>}
            trigger={<Button ref={buttonRef} className="w-12 h-12 xl:w-16 xl:h-16 shadow-lg rounded-full glass glass-hover ring-1 ring-black/10 flex items-center justify-center">
                <Search className="!size-6 sm:!size-7 xl:!size-9" />
            </Button>}
            showHeader={true}
            headerIcon={<Search className="w-5 h-5 text-primary" />}
            title="Tìm kiếm"
            description="Tìm kiếm không gian ảo"
            showCloseButton={true}
            showFooter={true}
            size="lg"
            mobileSize="lg"
            useCustomScrollbar={true}

        >
            <div className="space-y-3">
                {filteredHotspots.length > 0 ? (
                    filteredHotspots.map((hotspot) => (
                        <SearchResultCard
                            key={hotspot.hotspot_id}
                            hotspot={hotspot}
                            onSelect={handleSelectHotspot}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 glass glass-light rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                        <Search className="w-12 h-12 text-blue-400/90 mx-auto mb-4" />
                        <p className="text-white/80">
                            {search.trim() ? 'Không tìm thấy kết quả phù hợp' : 'Không có địa điểm nào'}
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

export default SearchDialogBlock
