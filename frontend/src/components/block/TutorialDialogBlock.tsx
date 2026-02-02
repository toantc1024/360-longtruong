
import { Button } from '../ui/button'
import DialogWrapper from './DialogWrapper'
import { PiQuestionFill } from 'react-icons/pi'
import {
    FiMenu,
    FiHome,
    FiMap,
    FiSearch,
    FiShare2,
    FiChevronLeft,
    FiChevronRight,
    FiChevronUp,
    FiInfo
} from 'react-icons/fi'
import { RiChatAiFill } from 'react-icons/ri'
import { PiInfoFill } from 'react-icons/pi'

const TutorialDialogBlock = () => {
    return (
        <DialogWrapper
            trigger={
                <Button className="w-10 h-10 md:w-12 lg:w-14 md:h-12 lg:h-14 shadow-lg rounded-full glass-hover bg-white/10 flex items-center justify-center cursor-pointer">
                    <PiQuestionFill className="!size-5 md:!size-7 lg:!size-9" />
                </Button>
            }
            showHeader={true}
            headerIcon={<PiQuestionFill className='text-primary' />}
            title="Hướng dẫn sử dụng"
            description=""
            showCloseButton={true}
            showFooter={false}
            size="xl"
            mobileSize="lg"
            useCustomScrollbar={true}
        >
            <div className="space-y-6 sm:space-y-8">
                {/* Left Navigation */}
                <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <FiMenu className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        </div>
                        Điều hướng bên trái
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 flex items-center justify-center flex-shrink-0">
                                <FiMenu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Menu chính</p>
                                <p className="text-white/70 text-xs sm:text-sm">Mở menu tùy chọn và cài đặt</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                <FiHome className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Về điểm chính</p>
                                <p className="text-white/70 text-xs sm:text-sm">Quay về điểm panorama chính của khu vực</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                <FiMap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Bản đồ</p>
                                <p className="text-white/70 text-xs sm:text-sm">Xem bản đồ tổng quan khu vực</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                <PiQuestionFill className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Trợ giúp</p>
                                <p className="text-white/70 text-xs sm:text-sm">Mở hướng dẫn sử dụng (đang xem)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Right Navigation */}
                <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <RiChatAiFill className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        </div>
                        Điều hướng phía trên bên phải
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center flex-shrink-0">
                                <RiChatAiFill className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Chatbot AI</p>
                                <p className="text-white/70 text-xs sm:text-sm">Hỏi đáp với trợ lý ảo về địa điểm</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center flex-shrink-0">
                                <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Tìm kiếm</p>
                                <p className="text-white/70 text-xs sm:text-sm">Tìm kiếm các địa điểm trong khu vực</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <FiChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                        </div>
                        Điều hướng phía dưới
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs sm:text-sm font-bold">360°</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Bộ chọn Panorama</p>
                                <p className="text-white/70 text-xs sm:text-sm">Chọn panorama hiện tại từ danh sách</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center flex-shrink-0">
                                <PiInfoFill className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Thông tin</p>
                                <p className="text-white/70 text-xs sm:text-sm">Xem thông tin chi tiết về địa điểm</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center flex-shrink-0">
                                <FiShare2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Chia sẻ</p>
                                <p className="text-white/70 text-xs sm:text-sm">Chia sẻ địa điểm với bạn bè</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center flex-shrink-0">
                                <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Ẩn/Hiện Carousel</p>
                                <p className="text-white/70 text-xs sm:text-sm">Thu gọn hoặc mở rộng danh sách panorama</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panorama Carousel */}
                <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <FiChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                        </div>
                        Carousel Panorama
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="flex gap-1">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white/10 flex items-center justify-center">
                                    <FiChevronLeft className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                </div>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white/10 flex items-center justify-center">
                                    <FiChevronRight className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Điều hướng trái/phải</p>
                                <p className="text-white/70 text-xs sm:text-sm">Di chuyển qua lại giữa các panorama</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-light rounded-xl border border-white/10">
                            <div className="w-8 h-6 sm:w-10 sm:h-8 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-medium">IMG</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base">Ảnh xem trước</p>
                                <p className="text-white/70 text-xs sm:text-sm">Nhấn vào ảnh để chuyển đến panorama đó</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* General Tips */}
                <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <FiInfo className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                        </div>
                        Mẹo sử dụng
                    </h3>
                    <div className="p-4 sm:p-5 glass-light rounded-xl border border-white/10">
                        <ul className="space-y-2 sm:space-y-3 text-white/80 text-sm sm:text-base">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                                <span>Kéo thả để xoay góc nhìn 360°</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></span>
                                <span>Nhấn vào các điểm hotspot để di chuyển</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></span>
                                <span>Sử dụng chatbot AI để tìm hiểu thêm về địa điểm</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0"></span>
                                <span>Pinch để zoom trên thiết bị di động</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DialogWrapper>
    )
}

export default TutorialDialogBlock
