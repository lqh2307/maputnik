# Maputnik UI

Maputnik UI là một trình soạn thảo trực quan cho các style MapLibre GL, được xây dựng bằng React, TypeScript, MUI và Zustand. Dự án tập trung vào việc tạo, chỉnh sửa và kiểm tra style JSON theo chuẩn MapLibre, đồng thời cung cấp giao diện quản lý layer/source, canvas bản đồ, inspect feature và export JSON.

## Tính năng chính

- Xem trực tiếp style trên bản đồ MapLibre và inspect feature khi ở chế độ inspect.
- Quản lý layer theo nhóm và tìm kiếm: lọc theo loại layer, ẩn/hiện, đổi tên, nhân bản, xóa, kéo thả sắp xếp.
- Chỉnh sửa paint/layout property theo schema MapLibre bằng giao diện từng trường và JSON editor.
- Thêm, cập nhật, đổi tên và xóa source; đổi tên source sẽ đồng bộ với layer đang tham chiếu.
- Tải style từ local file hoặc thay thế style hiện tại, kiểm tra lỗi validation, và xuất JSON theo định dạng chuẩn.
- Hỗ trợ undo/redo, copy/paste layer, shortcut keyboard, dark/light/system theme và lưu trạng thái vào localStorage.

## Yêu cầu môi trường

- Node.js 18+
- Yarn hoặc npm
- Trình duyệt hiện đại hỗ trợ WebGL và localStorage

## Khởi động

```bash
yarn install
yarn dev
```

Hoặc chạy trực tiếp app React:

```bash
yarn start
```

## Build và kiểm tra chất lượng

```bash
yarn build
yarn lint
```

## Cấu trúc dự án chính

```text
src/
├── App.tsx                 # Theme ứng dụng và root shell
├── index.tsx               # Entry point render React
├── stores/                 # Zustand stores: style state, history, dialogs
├── layouts/                # Layouts chính: topbar, canvas, panels, dialogs
├── components/             # Components UI chung: inputs, accordions, dialogs
├── hooks/                  # Custom React hooks
├── locales/                # File i18n tiếng Anh / Việt Nam
├── utils/                  # Helper chung cho file, định dạng, xử lý bên client
├── configs/                # Theme, runtime token, cấu hình style
└── types/                  # Type/contract bổ sung cho model hệ thống
```

## Kiến trúc state

- `useGlobalStore` là store chính quản lý style hiện tại, layer đang chọn, camera view, lịch sử undo/redo và state dirty.
- `useDialogStore` quản lý các dialog runtime như open/export/sources/settings/code.
- `src/layouts` chứa các UI panel và màn hình tổng hợp: TopBar, LayerPanel, PropertyPanel, MapCanvas, CodeEditor, EditorDialogs.
- `src/layouts/Utils.ts` đóng vai trò helper cho clone style, validate style, duplicate layer, resolve URL, và create layer mặc định.

## Lưu ý khi phát triển

- Dữ liệu chính của editor là MapLibre Style Specification v8.
- Mọi thay đổi trên style nên đi qua store để đảm bảo history, validation và persistence đồng bộ.
- `dirty` được bật khi style bị thay đổi và được reset khi lưu / markSaved.
- Nhiều dữ liệu UI được persist trong localStorage nhằm tối ưu trải nghiệm editor mà không cản ứng dụng.
