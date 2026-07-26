#!/usr/bin/env python3
"""
Automation Script: Fill Supabase Data for Long Trường 360 Project
Area ID: 27
Locations:
  - BTN  -> Bia Tưởng niệm Liệt sĩ Phường Long Trường (Hotspot ID: 39)
  - DTLP -> Đình Thần Long Phú (Hotspot ID: 38)
  - VB6X -> Di tích Căn cứ Vùng Bưng Sáu Xã (Hotspot ID: 37)
  - VPD  -> Trụ sở Đảng ủy Phường Long Trường (Hotspot ID: 129)

Usage:
  python automation/fill_data.py --service-key <YOUR_SUPABASE_SERVICE_ROLE_KEY>
  or set env var: export SUPABASE_SERVICE_ROLE_KEY=<YOUR_KEY>
"""

import os
import sys
import glob
import json
import argparse
from PIL import Image
import requests
from supabase import create_client, Client

# Default Configurations
SUPABASE_URL = "https://jmeiegtjrrdeubwzgder.supabase.co"
AREA_ID = 27
STORAGE_BUCKET = "APP_IMAGES"

# Location details mapping
LOCATIONS_DATA = {
    "BTN": {
        "hotspot_id": 39,
        "title": "Bia Tưởng niệm Liệt sĩ Phường Long Trường",
        "address": "7A Đường 44, Phường Phú Hữu, TP. Thủ Đức, TP. Hồ Chí Minh",
        "geolocation": {"lat": 10.7932397, "lon": 106.7994664},
        "description": (
            "Nhà Bia Liệt sĩ Phường Phú Hữu (thuộc Phường Long Trường) là công trình văn hóa - lịch sử "
            "có ý nghĩa tâm linh và giáo dục truyền thống sâu sắc. Đây là nơi ghi danh và tưởng niệm "
            "các anh hùng liệt sĩ, đồng bào đã dũng cảm chiến đấu, hy sinh vì sự nghiệp giải phóng dân tộc "
            "và bảo vệ Tổ quốc. Công trình nằm trong không gian trang nghiêm, xanh mát, là điểm đến tri ân "
            "của nhân dân và thế hệ trẻ địa phương vào các dịp lễ lớn."
        ),
        "click_panorama_id": "BTN_BTN_0_FLYCAM",
        "folder": "btn",
        "preview_source_image": "BTN_BTN_0_FLYCAM.JPG",
        "panoramas": [
            {"id": "BTN_BTN_0_FLYCAM", "title": "Toàn cảnh Bia Tưởng niệm (Flycam 360°)", "img": "BTN_BTN_0_FLYCAM.JPG"},
            {"id": "BTN_BTN_1_CONG", "title": "Cổng chính vào Bia Tưởng niệm", "img": "BTN_BTN_1_CONG.jpg"},
            {"id": "BTN_BTN_2_GIUA", "title": "Khuôn viên trung tâm Bia Tưởng niệm", "img": "BTN_BTN_2_GIUA.jpg"},
            {"id": "BTN_BTN_3_BIA", "title": "Khu vực Nhà Bia Tưởng niệm Liệt sĩ", "img": "BTN_BTN_3_BIA.jpg"},
        ]
    },
    "DTLP": {
        "hotspot_id": 38,
        "title": "Đình Thần Long Phú",
        "address": "Đình Thần Phước Hậu, Đường Long Phước, TP. Thủ Đức, TP. Hồ Chí Minh",
        "geolocation": {"lat": 10.800954, "lon": 106.8620821},
        "description": (
            "Đình Thần Long Phú là di tích kiến trúc nghệ thuật và tín ngưỡng dân gian lâu đời tại vùng đất "
            "Nam Bộ. Đình là nơi thờ phụng Thành Hoàng Bổn Cảnh cùng các vị tiền hiền, hậu hiền đã có công khai hoang, "
            "lập thôn trấn cõi. Nơi đây lưu giữ nhiều nét kiến trúc cổ truyền độc đáo với mái ngói âm dương và "
            "những chạm khắc gỗ tinh xảo. Hằng năm, đình diễn ra các lễ hội Kỳ Yên truyền thống thu hút đông đảo "
            "nhân dân đến chiêm bái, cầu mong quốc thái dân an."
        ),
        "click_panorama_id": "DTLP_DTLP_0_FLYCAM",
        "folder": "dtlp",
        "preview_source_image": "DTLP_DTLP_0_FLYCAM.JPG",
        "panoramas": [
            {"id": "DTLP_DTLP_0_FLYCAM", "title": "Toàn cảnh Đình Thần Long Phú (Flycam 360°)", "img": "DTLP_DTLP_0_FLYCAM.JPG"},
            {"id": "DTLP_DTLP_1_CONG", "title": "Cổng chính Đình Thần Long Phú", "img": "DTLP_DTLP_1_CONG.jpg"},
            {"id": "DTLP_DTLP_2_BIA", "title": "Sân đình và Bia ghi danh", "img": "DTLP_DTLP_2_BIA.jpg"},
            {"id": "DTLP_DTLP_2_CUA", "title": "Cửa chính gian Đình Thần Long Phú", "img": "DTLP_DTLP_2_CUA.jpg"},
            {"id": "DTLP_DTLP_2_GIUA", "title": "Khuôn viên sân giữa Đình Thần", "img": "DTLP_DTLP_2_GIUA.jpg"},
            {"id": "DTLP_DTLP_3_SANH", "title": "Tiền sảnh gian Chánh điện", "img": "DTLP_DTLP_3_SANH.jpg"},
            {"id": "DTLP_DTLP_4_1", "title": "Không gian thờ cúng gian chính (Góc 1)", "img": "DTLP_DTLP_4_1.jpg"},
            {"id": "DTLP_DTLP_4_2", "title": "Không gian thờ cúng gian chính (Góc 2)", "img": "DTLP_DTLP_4_2.jpg"},
            {"id": "DTLP_DTLP_4_3", "title": "Không gian nội thất trang nghiêm Đình Thần", "img": "DTLP_DTLP_4_3.jpg"},
        ]
    },
    "VB6X": {
        "hotspot_id": 37,
        "title": "Di tích Căn cứ Vùng Bưng Sáu Xã",
        "address": "Đường Lã Xuân Oai, Phường Long Trường, TP. Thủ Đức, TP. Hồ Chí Minh",
        "geolocation": {"lat": 10.82581104600007, "lon": 106.80659958500007},
        "description": (
            "Di tích Căn cứ Vùng Bưng 6 Xã là khu di tích lịch sử cách mạng quan trọng tại TP. Thủ Đức. "
            "Với diện tích khoanh vùng bảo vệ khoảng 1ha, di tích bao gồm Miếu Ngũ Hành và không gian tái hiện "
            "vùng căn cứ xưa mang đặc trưng của vùng bưng Nam Bộ. Đây là nơi bám trụ chiến lược của Huyện ủy, "
            "lực lượng vũ trang và nhân dân trong 30 năm kháng chiến, góp phần quan trọng vào sự nghiệp giải phóng miền Nam."
        ),
        "click_panorama_id": "VB6X_VB6X_0_FLYCAM_CONG",
        "folder": "vb6x",
        "preview_source_image": "VB6X_VB6X_0_FLYCAM_CONG.JPG",
        "panoramas": [
            {"id": "VB6X_VB6X_0_FLYCAM_CONG", "title": "Toàn cảnh cổng Căn cứ Vùng Bưng 6 Xã (Flycam 360°)", "img": "VB6X_VB6X_0_FLYCAM_CONG.JPG"},
            {"id": "VB6X_VB6X_0_FLYCAM_TD", "title": "Toàn cảnh Tượng đài Căn cứ Vùng Bưng 6 Xã (Flycam 360°)", "img": "VB6X_VB6X_0_FLYCAM_TD.JPG"},
            {"id": "VB6X_VB6X_1_CONG", "title": "Cổng chính vào Khu di tích Căn cứ Vùng Bưng 6 Xã", "img": "VB6X_VB6X_1_CONG.jpg"},
            {"id": "VB6X_VB6X_2_NTT", "title": "Nhà truyền thống Căn cứ Vùng Bưng 6 Xã", "img": "VB6X_VB6X_2_NTT.jpg"},
            {"id": "VB6X_VB6X_3_SANH", "title": "Sảnh chính Nhà truyền thống", "img": "VB6X_VB6X_3_SANH.jpg"},
            {"id": "VB6X_VB6X_3_PHAI", "title": "Khu vực trưng bày cánh phải", "img": "VB6X_VB6X_3_PHAI.jpg"},
            {"id": "VB6X_VB6X_3_TRAI", "title": "Khu vực trưng bày cánh trái", "img": "VB6X_VB6X_3_TRAI.jpg"},
            {"id": "VB6X_VB6X_4_LAU", "title": "Tầng lầu Nhà truyền thống", "img": "VB6X_VB6X_4_LAU.jpg"},
            {"id": "VB6X_VB6X_4_LAU_PHAI", "title": "Tầng lầu cánh phải", "img": "VB6X_VB6X_4_LAU_PHAI.jpg"},
            {"id": "VB6X_VB6X_4_LAU_TRAI", "title": "Tầng lầu cánh trái", "img": "VB6X_VB6X_4_LAU_TRAI.jpg"},
            {"id": "VB6X_VB6X_TD1", "title": "Khu vực Tượng đài anh hùng lịch sử (Góc 1)", "img": "VB6X_VB6X_TD1.jpg"},
            {"id": "VB6X_VB6X_TD2", "title": "Khu vực Tượng đài anh hùng lịch sử (Góc 2)", "img": "VB6X_VB6X_TD2.jpg"},
            {"id": "VB6X_VB6X_TD3", "title": "Khu vực Tượng đài anh hùng lịch sử (Góc 3)", "img": "VB6X_VB6X_TD3.jpg"},
            {"id": "VB6X_VB6X_TD4", "title": "Khu vực Tượng đài anh hùng lịch sử (Góc 4)", "img": "VB6X_VB6X_TD4.jpg"},
            {"id": "VB6X_VB6X_TD5", "title": "Khu vực Tượng đài anh hùng lịch sử (Góc 5)", "img": "VB6X_VB6X_TD5.jpg"},
        ]
    },
    "VPD": {
        "hotspot_id": 129,
        "title": "Trụ sở Đảng ủy Phường Long Trường",
        "address": "893 Nguyễn Duy Trinh, Phường Long Trường, TP. Thủ Đức, TP. Hồ Chí Minh",
        "geolocation": {"lat": 10.7914436, "lon": 106.7985289},
        "description": (
            "Trụ sở Đảng ủy Phường Long Trường là cơ quan lãnh đạo của Đảng bộ phường, chỉ đạo và tổ chức "
            "thực hiện các chủ trương, nghị quyết của Đảng trên địa bàn. Đây là nơi diễn ra các hoạt động "
            "lãnh đạo, điều hành, họp giao ban và sinh hoạt Đảng nhằm xây dựng hệ thống chính trị vững mạnh, "
            "thúc đẩy phát triển kinh tế - xã hội, bảo đảm quốc phòng, an ninh địa phương."
        ),
        "click_panorama_id": "VPD_VPD_0_FLYCAM",
        "folder": "vpd",
        "preview_source_image": "VPD_VPD_0_FLYCAM.JPG",
        "panoramas": [
            {"id": "VPD_VPD_0_FLYCAM", "title": "Toàn cảnh Trụ sở Đảng ủy Phường Long Trường (Flycam 360°)", "img": "VPD_VPD_0_FLYCAM.JPG"},
            {"id": "VPD_VPD_1", "title": "Cổng chính và khuôn viên Trụ sở Đảng ủy", "img": "VPD_VPD_1.jpg"},
            {"id": "VPD_VPD_2", "title": "Khung cảnh chính Trụ sở Đảng ủy Phường Long Trường", "img": "VPD_VPD_2.jpg"},
        ]
    }
}


def crop_image(src_path, dest_path, target_width=1200, target_height=675):
    """
    Crops image keeping 16:9 ratio, centered, not too small.
    """
    with Image.open(src_path) as img:
        img = img.convert("RGB")
        width, height = img.size
        
        # Calculate crop box for 16:9 aspect ratio
        target_aspect = target_width / target_height
        current_aspect = width / height

        if current_aspect > target_aspect:
            # Image is wider than 16:9 -> crop horizontal sides
            new_width = int(height * target_aspect)
            offset = (width - new_width) // 2
            box = (offset, 0, offset + new_width, height)
        else:
            # Image is taller than 16:9 -> crop top/bottom
            new_height = int(width / target_aspect)
            offset = (height - new_height) // 2
            box = (0, offset, width, offset + new_height)

        cropped = img.crop(box)
        cropped.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
        cropped.save(dest_path, "JPEG", quality=90)
    return dest_path


def main():
    parser = argparse.ArgumentParser(description="Fill Supabase data for Long Trường 360 project.")
    parser.add_argument("--service-key", help="Supabase Service Role Key (bypasses RLS for write)")
    args = parser.parse_args()

    service_key = args.service_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not service_key:
        print("[ERROR] Supabase Service Role Key is required to write data to Supabase tables and storage.")
        print("Please provide it via --service-key or set SUPABASE_SERVICE_ROLE_KEY environment variable.")
        sys.exit(1)

    print("Connecting to Supabase using Service Role Key...")
    supabase: Client = create_client(SUPABASE_URL, service_key)

    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    temp_dir = os.path.join(repo_root, "automation", "temp")
    os.makedirs(temp_dir, exist_ok=True)

    for code, info in LOCATIONS_DATA.items():
        print(f"\n==================================================")
        print(f"Processing Location [{code}]: {info['title']}")
        print(f"==================================================")

        folder_path = os.path.join(repo_root, "jpg", info["folder"])
        
        # 1. Generate & Upload Preview Image for Hotspot
        preview_src = os.path.join(folder_path, info["preview_source_image"])
        if not os.path.exists(preview_src):
            print(f"[WARN] Preview source image not found at {preview_src}, searching folder...")
            candidates = glob.glob(os.path.join(folder_path, "*.[jJ][pP][gG]"))
            if candidates:
                preview_src = candidates[0]

        hotspot_preview_url = None
        if os.path.exists(preview_src):
            cropped_file = os.path.join(temp_dir, f"hotspot_{info['hotspot_id']}_preview.jpg")
            crop_image(preview_src, cropped_file, target_width=1200, target_height=675)
            
            storage_path = f"{AREA_ID}/hotspots/hotspot_{info['hotspot_id']}_preview.jpg"
            print(f"Uploading Hotspot Preview Image -> {storage_path}...")
            with open(cropped_file, "rb") as f:
                supabase.storage.from_(STORAGE_BUCKET).upload(
                    path=storage_path,
                    file=f.read(),
                    file_options={"content-type": "image/jpeg", "upsert": "true"}
                )
            hotspot_preview_url = f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{storage_path}"
            print(f"Hotspot Preview URL: {hotspot_preview_url}")

        # 2. Update Hotspot Record in Supabase
        hotspot_payload = {
            "hotspot_id": info["hotspot_id"],
            "area_id": AREA_ID,
            "title": info["title"],
            "description": info["description"],
            "address": info["address"],
            "geolocation": info["geolocation"],
            "click_panorama_id": info["click_panorama_id"],
        }
        if hotspot_preview_url:
            hotspot_payload["preview_image"] = hotspot_preview_url

        print(f"Upserting Hotspot [ID: {info['hotspot_id']}]...")
        res_h = supabase.table("hotspots").upsert(hotspot_payload).execute()
        print(f"Hotspot Upsert Done.")

        # 3. Process Panoramas for this Hotspot
        for pan in info["panoramas"]:
            pan_id = pan["id"]
            pan_title = pan["title"]
            pan_src_img = os.path.join(folder_path, pan["img"])

            pan_preview_url = None
            if os.path.exists(pan_src_img):
                pan_cropped_file = os.path.join(temp_dir, f"pan_{pan_id}_preview.jpg")
                crop_image(pan_src_img, pan_cropped_file, target_width=800, target_height=450)
                
                pan_storage_path = f"{AREA_ID}/panoramas/pan_{pan_id}_preview.jpg"
                print(f"Uploading Panorama Thumbnail [{pan_id}] -> {pan_storage_path}...")
                with open(pan_cropped_file, "rb") as f:
                    supabase.storage.from_(STORAGE_BUCKET).upload(
                        path=pan_storage_path,
                        file=f.read(),
                        file_options={"content-type": "image/jpeg", "upsert": "true"}
                    )
                pan_preview_url = f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{pan_storage_path}"

            pan_payload = {
                "panorama_id": pan_id,
                "hotspot_id": info["hotspot_id"],
                "title": pan_title,
            }
            if pan_preview_url:
                pan_payload["preview_image"] = pan_preview_url

            print(f"  -> Upserting Panorama [{pan_id}]: {pan_title}")
            supabase.table("panoramas").upsert(pan_payload).execute()

    print("\n==================================================")
    print("SUCCESS: All locations and panoramas filled & uploaded successfully!")
    print("==================================================")

if __name__ == "__main__":
    main()
