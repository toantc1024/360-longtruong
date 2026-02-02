import { Button } from "../ui/button";
import { BackgroundBeamsWithCollision } from "../ui/shadcn-io/background-beams-with-collision";
import { useNavigate } from 'react-router-dom'

export default function Component() {
    const navigate = useNavigate()
    return (
        <BackgroundBeamsWithCollision className="!h-screen">
            <div className="flex items-center h-screen px-4 z-20 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative">
                <div className="w-full space-y-6 text-center">
                    <div className="space-y-3">
                        <h1 className="text-8xl font-bold tracking-tighter sm:text-8xl transition-transform text-blue-600">
                            404
                        </h1>
                        <p className="text-gray-500">
                            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            navigate("/");
                        }}
                        className="inline-flex h-10 items-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300 cursor-pointer"
                    >
                        Trở về trang chủ
                    </Button>
                </div>
            </div>
        </BackgroundBeamsWithCollision>
    );
}
