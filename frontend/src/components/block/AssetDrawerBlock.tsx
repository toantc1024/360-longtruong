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
            <Drawer.Title className="px-4 text-2xl text-white mt-2 font-medium">
                {currentAsset?.title}
            </Drawer.Title>

            {/* Asset Image */}
            <div className="flex flex-col flex-reverse md:flex-row justify-center  gap-8 ">
                <div className="flex  w-full max-w-md  flex-col">
                    <h2 className=' font-bold flex gap-2 items-center text-2xl font text-shadow-xl py-2 text-white' ><Info />Thông tin</h2>

                    <div className=' h-full overflow-auto rounded-3xl text-white py-2 px-4 glass glass-light text-whiterounded-3xl'>
                        <h2 >{currentAsset?.description}</h2>
                    </div>
                </div>
                {currentAsset?.image_url && (
                    <div className="flex flex-col justify-center rounded-3xl overflow-hidden">
                        <h2 className=' font-bold flex gap-2 items-center text-2xl font text-shadow-xl py-2 text-white' ><Info />Hình ảnh</h2>
                        <img
                            src={currentAsset.image_url}
                            alt={currentAsset.title}
                            className="w-auto h-[250px] object-cover rounded-3xl"
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
