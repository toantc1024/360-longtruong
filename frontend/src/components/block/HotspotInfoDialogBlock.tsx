
import { Button } from '../ui/button'
import DialogWrapper from './DialogWrapper'
import {
    InfoIcon,
} from 'lucide-react'
import type { Hotspot } from '@/types/hotspots.service.type'
import type { Panorama } from '@/types/panoramas.service.type'

import HotspotInfoBlock from './HotspotInfoBlock'

const HotspotInfoDialogBlock = ({
    pill, hotspot
}: {
    pill: any
    hotspot: Hotspot | null
    panoramas?: Panorama[]
}) => {
    return (
        <DialogWrapper
            trigger={
                <Button
                    key={pill.id}
                    className="shadow-lg rounded-full glass glass-hover flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
                >
                    {pill.icon && (
                        <pill.icon className="w-3 h-3 mr-1" />
                    )}
                    {pill.label}
                </Button>
            }
            showHeader={true}
            headerIcon={<InfoIcon className="w-5 h-5 text-primary" />}
            title="Thông tin địa điểm"
            description="Chi tiết về điểm tham quan"
            showCloseButton={true}
            showFooter={false}
            size="full"
            mobileSize="full"
            useCustomScrollbar={true}
        >
            <HotspotInfoBlock hotspot={hotspot} />
            {/* <HotspotInfoTabs hotspot={hotspot} /> */}
        </DialogWrapper>
    )
}

export default HotspotInfoDialogBlock
