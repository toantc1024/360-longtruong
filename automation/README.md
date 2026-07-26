# Automation Scripts for Long Trường 360

Automation tool to process images, crop thumbnails (16:9 ratio), query location info, and sync `hotspots` & `panoramas` tables with Supabase Storage and Database.

## Installation

```bash
pip install -r automation/requirements.txt
```

## Running the Automation Script

Execute the script with your Supabase Service Role Key:

```bash
python automation/fill_data.py --service-key <YOUR_SUPABASE_SERVICE_ROLE_KEY>
```

Or set the environment variable:

```bash
export SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>
python automation/fill_data.py
```

## What it does:
1. **Bia Tưởng niệm (BTN)** -> Hotspot 39
2. **Đình Thần Long Phú (DTLP)** -> Hotspot 38
3. **Căn cứ Vùng Bưng Sáu Xã (VB6X)** -> Hotspot 37
4. **Trụ sở Đảng ủy Phường Long Trường (VPD)** -> Hotspot 129
5. **Cắt ảnh xem trước (Preview Images)**: Cắt tỷ lệ chuẩn 16:9 không quá nhỏ.
6. **Upload & Sync**: Tải ảnh lên Supabase Storage (`APP_IMAGES/27/...`) và cập nhật cơ sở dữ liệu `hotspots` & `panoramas`.
