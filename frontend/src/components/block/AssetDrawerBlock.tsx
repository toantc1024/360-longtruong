import { clsx } from 'clsx';
import type { Asset } from '@/types/asset.type';
import { Info, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Drawer } from 'vaul';


export default function AssetDrawerBlock({
    currentAsset,
    setCurrentAsset,
    snap
}: {
    currentAsset: Asset | null;
    setCurrentAsset: (asset: Asset | null) => void;
    showMedia: (mediaName: string) => void;
    snap: number | string | null;
}) {
    return (
        <div
            className={clsx('flex gap-4 flex-col max-w-full h-full w-full p-4 pt-5', {
                'overflow-y-auto': snap === 1,
                'overflow-hidden': snap !== 1,
            })}
        >
            <Drawer.Title className="px-4 text-2xl md:text-3xl text-white mt-2 font-bold">
                {currentAsset?.title}
            </Drawer.Title>

            {/* Asset Image */}
            <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8 overflow-y-auto">
                <div className="flex w-full md:max-w-md flex-col">
                    <h2 className='font-bold flex gap-2 items-center text-xl md:text-2xl text-shadow-xl py-2 text-white'><Info />Thông tin</h2>

                    <div className='h-full overflow-auto rounded-3xl text-white py-3 px-5 glass glass-light'>
                        <p className='text-base md:text-lg leading-relaxed'>{currentAsset?.description}</p>
                    </div>
                </div>
                {currentAsset?.image_url && (
                    <div className="flex flex-col justify-center rounded-3xl overflow-hidden flex-shrink-0">
                        <h2 className='font-bold flex gap-2 items-center text-xl md:text-2xl text-shadow-xl py-2 text-white'><Info />Hình ảnh</h2>
                        <img
                            src={currentAsset.image_url}
                            alt={currentAsset.title}
                            className="w-auto max-w-full h-[300px] md:h-[400px] object-cover rounded-3xl"
                        />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-2 right-[1rem] absolute right-0">
                <Button
                    onClick={() => {
                        setCurrentAsset(null);
                    }}
                    variant={"ghost"}
                    className='cursor-pointer font-bold border-1 border-black/20 glass-light glass-hover !text-white h-10 w-10 rounded-full'
                >
                    <X />
                </Button>
            </div>
        </div>
    );
}
