import { useState } from 'react'
import { Button } from '../ui/button'
import DialogWrapper from './DialogWrapper'
import {
    Share2,
    Copy,
    CheckCircle,
    MessageCircle,
    Facebook,
} from 'lucide-react'
import { toast } from 'sonner'

interface ShareDialogBlockProps {
    pill: {
        id: string
        label: string
        icon: any
    }
    shareData?: {
        title?: string
        description?: string
        url?: string
    }
}

const ShareDialogBlock = ({ pill, shareData }: ShareDialogBlockProps) => {
    const [copied, setCopied] = useState(false)

    // Get current page URL or use provided URL
    const currentUrl = shareData?.url || (typeof window !== 'undefined' ? window.location.href : '')
    const title = shareData?.title || (typeof document !== 'undefined' ? document.title : 'VR Experience')
    const description = shareData?.description || 'Khám phá không gian ảo 360°'

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl)
            setCopied(true)
            toast.success('Đã sao chép liên kết!')
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy: ', err)
            toast.error('Không thể sao chép liên kết')
        }
    }

    const shareToMessenger = () => {
        try {
            const messengerUrl = `fb-messenger://share/?link=${encodeURIComponent(currentUrl)}`
            const webUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(currentUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(currentUrl)}`

            // Try app protocol first, fallback to web
            window.open(messengerUrl, '_blank')

            // Fallback for web if app doesn't open
            setTimeout(() => {
                const userAgent = navigator.userAgent.toLowerCase()
                if (!userAgent.includes('fban') && !userAgent.includes('fbav')) {
                    window.open(webUrl, '_blank', 'width=600,height=400')
                }
            }, 500)
        } catch (err) {
            console.error('Failed to share to Messenger: ', err)
            toast.error('Không thể chia sẻ qua Messenger')
        }
    }

    const shareToFacebook = () => {
        try {
            const facebookAppUrl = `fb://share?href=${encodeURIComponent(currentUrl)}`
            const facebookWebUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(title)}`

            // Try app protocol first
            window.open(facebookAppUrl, '_blank')

            // Fallback to web
            setTimeout(() => {
                window.open(facebookWebUrl, '_blank', 'width=600,height=400')
            }, 500)
        } catch (err) {
            console.error('Failed to share to Facebook: ', err)
            toast.error('Không thể chia sẻ lên Facebook')
        }
    }

    const shareOptions = [
        {
            id: 'copy',
            label: 'Sao chép liên kết',
            icon: copied ? CheckCircle : Copy,
            onClick: copyToClipboard,
            className: 'text-white',
            iconBgClass: copied ? 'bg-green-500/20 border-green-500/30' : 'bg-blue-500/20 border-blue-500/30',
            description: 'Sao chép URL để chia sẻ'
        },
        {
            id: 'messenger',
            label: 'Messenger',
            icon: MessageCircle,
            onClick: shareToMessenger,
            className: 'text-white',
            iconBgClass: 'bg-blue-500/20 border-blue-500/30',
            description: 'Chia sẻ qua Facebook Messenger'
        },
        {
            id: 'facebook',
            label: 'Facebook',
            icon: Facebook,
            onClick: shareToFacebook,
            className: 'text-white',
            iconBgClass: 'bg-blue-600/20 border-blue-600/30',
            description: 'Chia sẻ lên Facebook'
        }
    ]

    // Native Web Share API fallback
    const nativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: description,
                    url: currentUrl
                })
            } catch (err) {
                console.error('Error sharing:', err)
                // Only show error if it's not a user cancellation
                if (err instanceof Error && err.name !== 'AbortError') {
                    toast.error('Không thể chia sẻ')
                }
            }
        }
    }

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
            headerIcon={<Share2 className="w-5 h-5 text-primary" />}
            title="Chia sẻ"
            description="Chia sẻ không gian ảo này"
            showCloseButton={true}
            showFooter={false}
            size="md"
            mobileSize="sm"
            useCustomScrollbar={true}
        >
            <div className="space-y-4">
                {/* Share Options */}
                <div className="space-y-3">
                    <h4 className="text-white/80 text-sm font-medium">Chọn phương thức chia sẻ</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {shareOptions.map((option) => (
                            <Button
                                key={option.id}
                                onClick={option.onClick}
                                className="glass-light glass-hover rounded-xl p-4 h-auto flex items-center gap-3 justify-start transition-all hover:scale-[1.02] border border-white/10"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${option.iconBgClass}`}>
                                    <option.icon className={`w-5 h-5 ${option.className}`} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-white font-medium text-sm">{option.label}</p>
                                    <p className="text-white/60 text-xs">{option.description}</p>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Native Share (if available) */}
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <div className="pt-2 border-t border-white/10">
                        <Button
                            onClick={nativeShare}
                            className="w-full glass-light glass-hover rounded-xl p-3 text-white/80 hover:text-white transition-colors"
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Chia sẻ khác
                        </Button>
                    </div>
                )}
            </div>
        </DialogWrapper>
    )
}

export default ShareDialogBlock
