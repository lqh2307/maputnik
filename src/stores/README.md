# Hệ thống store của Maputnik

Thư mục [src/stores](./index.ts) chứa các Zustand store dùng để quản lý trạng thái của ứng dụng Maputnik Style Editor. Trạng thái tài liệu bản đồ và không gian làm việc được tập trung trong `useGlobalStore`, chế độ tương tác canvas nằm trong `useMapModeStore`, giao diện màu nằm trong `useThemeStore`, ngôn ngữ giao diện nằm trong `useLanguageStore`, còn trạng thái hiển thị runtime của các dialog được quản lý độc lập trong `useDialogStore`.

## Các store hiện có

| Store              | File                                    | Trách nhiệm                                                                                          |
| ------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `useGlobalStore`   | [GlobalStore.tsx](./GlobalStore.tsx)    | Quản lý style hiện tại, layer, source, camera view, lịch sử undo/redo, dirty state và search/filter. |
| `useMapModeStore`  | [MapModeStore.tsx](./MapModeStore.tsx)  | Quản lý chế độ điều hướng/kiểm tra feature của map canvas.                                           |
| `useThemeStore`    | [ThemeStore.tsx](./ThemeStore.tsx)      | Quản lý giao diện màu của application shell.                                                         |
| `useLanguageStore` | [LanguageStore.tsx](./LanguageStore.tsx)| Quản lý ngôn ngữ hiển thị của ứng dụng và đồng bộ với i18n/localStorage.                             |
| `useDialogStore`   | [DialogStore.tsx](./DialogStore.tsx)    | Quản lý trạng thái mở/đóng dialog runtime của editor.                                                |

Các type public được định nghĩa trong [Types.tsx](./Types.tsx). `index.ts` re-export các store và type để các UI component trong [src/layouts](../layouts/index.ts) có thể import đúng cách.

## Kiến trúc dữ liệu

```text
useGlobalStore
├── style: StyleSpecification
├── selectedLayerId?: string
├── search: string
├── layerTypeFilter: string
├── collapsedGroups: Set<string>
├── inspectorFeatures: InspectorFeature[]
├── layerClipboard?: LayerSpecification
├── viewState: { longitude, latitude, zoom, bearing, pitch }
├── history: { past: StyleSpecification[], future: StyleSpecification[] }
├── dirty: boolean
└── actions:
    ├── Style lifecycle: loadStyle, replaceStyle, newStyle, updateRoot, markSaved
    ├── Layer lifecycle: addLayer, updateLayer, updateLayerProperty, deleteLayer, duplicateLayer, copyLayer, pasteLayer, toggleLayerVisibility, moveLayer, selectLayer
    ├── Source lifecycle: upsertSource, deleteSource
    ├── View/UI: setSearch, setLayerTypeFilter, toggleGroup, setInspectorFeatures, setViewState
    └── History: undo, redo

useMapModeStore
├── mapMode: "map" | "inspect"
└── actions: setMapMode

useThemeStore
├── themeMode: ThemeMode ("system" | "black" | "blue" | "grey" | "white")
└── actions: setTheme

useLanguageStore
├── language: string ("vietnamese" | "english")
└── actions: setLanguage
```

## `useGlobalStore` chi tiết

### 1. Quản lý Style & Root

- `loadStyle(style)`: Nạp một style mới từ tệp, URL hoặc thư viện mẫu. Khởi tạo camera view và làm mới lịch sử.
- `newStyle()`: Đặt lại editor về template mặc định tích hợp sẵn.
- `replaceStyle(style)`: Thay thế toàn bộ style đang chỉnh sửa và ghi một snapshot lịch sử.
- `updateRoot(patch)`: Cập nhật các thuộc tính cấp cao của style (name, center, zoom, glyphs, sprite, light, transition).
- `markSaved()`: Đánh dấu style đã được lưu, xóa cờ `dirty`.

### 2. Quản lý Layers

- `addLayer(type, sourceId)`: Tạo một layer mới với ID duy nhất và đưa vào danh sách layers.
- `updateLayer(layerId, patch)`: Cập nhật cấu hình của layer hoặc đổi type/source tương ứng.
- `updateLayerProperty(layerId, section, property, value)`: Cập nhật một thuộc tính paint hoặc layout cụ thể.
- `deleteLayer(layerId)`: Xóa layer khỏi danh sách và tự động chuyển selection sang layer kế cận.
- `duplicateLayer(layerId)`: Nhân bản một layer và chèn ngay sau layer gốc.
- `copyLayer(layerId)` / `pasteLayer()`: Sao chép layer vào clipboard nội bộ và hệ thống, dán layer mới vào vị trí đang chọn.
- `toggleLayerVisibility(layerId)`: Bật/tắt thuộc tính `layout.visibility` giữa `"visible"` và `"none"`.
- `moveLayer(activeId, overId, placement)`: Thay đổi vị trí (z-order) của layer trong danh sách.
- `selectLayer(layerId)`: Chọn layer active để hiển thị trên property panel.

### 3. Quản lý Sources

- `upsertSource(sourceId, source, previousId)`: Thêm hoặc cập nhật một source (vector, raster, geojson, raster-dem, image, video). Khi source đổi ID, các layer tham chiếu sẽ được tự động cập nhật.
- `deleteSource(sourceId)`: Xóa source và xóa tất cả các layer đang tham chiếu tới source đó.

### 4. Lịch sử & Undo/Redo

- `undo()`: Khôi phục lại trạng thái style liền trước trong ngăn xếp `history.past`.
- `redo()`: Khôi phục lại trạng thái style trong ngăn xếp `history.future`.
- `commitEditorStyle`: Tạo bản sao sâu của style hiện tại, áp dụng mutation draft, tự động lưu vào `localStorage` và ghi snapshot lịch sử (giới hạn tối đa 80 bước).

## `useMapModeStore` chi tiết

Map mode store quản lý riêng chế độ tương tác của canvas. `setMapMode("map" | "inspect")` chuyển giữa điều hướng bản đồ và kiểm tra feature.

## `useThemeStore` chi tiết
 
Theme store quản lý riêng giao diện màu của application shell. `setTheme(theme)` cập nhật theme hiện tại.
 
## `useLanguageStore` chi tiết
 
Language store quản lý ngôn ngữ hiển thị của ứng dụng. `setLanguage(language)` cập nhật ngôn ngữ hiện tại và kích hoạt chuyển đổi ngôn ngữ trong `i18n`.
 
## `useDialogStore` chi tiết

Dialog store lưu trạng thái mở/đóng độc lập của các modal dialog trong editor:

- `code`: Modal trình chỉnh sửa mã JSON trực tiếp.
- `open`: Modal mở style (từ gallery, URL hoặc tệp tải lên).
- `export`: Modal xuất style (tải JSON, copy URL, cấu hình export).
- `sources`: Modal quản lý và chỉnh sửa nguồn dữ liệu (Sources).
- `settings`: Modal cấu hình siêu dữ liệu style (Style metadata & settings).
- `shortcuts`: Modal danh sách phím tắt thao tác nhanh.

Sử dụng:

- `updateDialog({ open: true })`: Mở dialog cụ thể.
- `closeDialogs()`: Đóng tất cả dialog cùng lúc.

## Helper trong Utils

File [Utils.ts](./Utils.ts) cung cấp các hàm hỗ trợ:

- `loadPersistedEditorStyle` / `persistEditorStyle`: Tương tác với `localStorage` (`maputnik-mui-style`).
- `loadEditorLayerClipboard` / `persistEditorLayerClipboard`: Tương tác với clipboard layer (`maputnik-mui-layer-clipboard`).
- `commitEditorStyle`: Bao đóng logic ghi nhận mutation style và cập nhật snapshot lịch sử.
- `createInitDialog`: Khởi tạo state rỗng cho dialogs.
- `createInitGlobalStore`: Khởi tạo state ban đầu cho global store.

## Quy ước khi phát triển Store

1. Cập nhật type công khai trong [Types.tsx](./Types.tsx).
2. Tách biệt rõ ràng giữa Attributes (State) và Methods (Actions).
3. Đảm bảo tính độc lập giữa các store; không import store này vào store khác (`no-restricted-imports`).
4. Các thao tác thay đổi style phải thực hiện thông qua `commitEditorStyle` để đảm bảo `history`, `dirty` và `localStorage` luôn đồng bộ.
5. Luôn viết JSDoc cho mọi hàm action và thuộc tính state.
