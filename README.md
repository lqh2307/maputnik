# FE Report

FE Report là editor report/canvas chạy trên trình duyệt. Người dùng tạo nhiều tab canvas, thêm và chỉnh sửa shape Konva, dùng nền ảnh hoặc nền MapLibre, rồi export/import hoặc trình chiếu các tab như slide. Ứng dụng được xây trên React, TypeScript, MUI, Zustand, Konva và MapLibre.

## Chạy dự án

```bash
npm install
npm run dev
```

Các script chính:

- `npm run dev` hoặc `npm start`: chạy development server qua CRACO.
- `npm run build`: tạo production build.
- `npm run lint`: lint toàn bộ source.
- `npm run socket-server:local`: chạy Yjs WebSocket server ở cổng `8386` cho demo collaboration.

## Kiến trúc hệ thống

```text
Browser
└─ src/index.tsx
   └─ App
      ├─ ?mode=presenter → PresenterViewWindow
      └─ Editor
         ├─ AppTheme + i18n + Toaster
         ├─ TopBar / LeftBar / RightBar / BottomBar
         ├─ Canvas
         │  └─ KonvaStage
         │     ├─ non-interact layer: Background → Grid → Frame
         │     ├─ shape layer: tab.shapes
         │     ├─ interact layer: Transformers
         │     └─ overlay layer: selection rectangle, guide lines, eraser, mask
         ├─ dialogs
         └─ Slideshow / presenter popup
```

`Editor` là application shell. Nó dựng lưới MUI gồm top/left/right/bottom bar và vùng canvas; kích thước các vùng nằm trong `useGlobalStore`. Khi resize cửa sổ hoặc đổi kích thước thanh UI, editor gọi `fitStage` để đồng bộ viewport stage. Khi URL có `?id=…`, `Editor` tải report metadata, tải JSON shape gắn với report, rồi thay shapes của tab active.

`App` chặn một số phím tắt của trình duyệt (`Ctrl`/`Cmd` + `s`, `i`, `u`, `w`, `-`, `+`) và browser zoom bằng wheel có modifier. Nếu query `mode=presenter`, app chỉ render `PresenterViewWindow`, không render editor đầy đủ.

## Các lớp chính

| Lớp                    | Thư mục                                                       | Vai trò                                                                                              |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Application shell      | `src/App.tsx`, `src/layouts`                                  | Bố cục editor, toolbar, panel, dialog, trình chiếu và presenter window.                              |
| Canvas                 | `src/layouts/Canvas`                                          | Điều phối pointer/keyboard, drawing, selection, clipboard, drag/drop, layer Konva và motion runtime. |
| Konva renderer         | `src/components/KonvaShape`                                   | Render stage, overlay và các loại shape; cung cấp imperative API cho store.                          |
| State                  | `src/stores`                                                  | Zustand state cho document, selection, history, tool overlay, preview motion và presentation.        |
| Domain utility         | `src/utils/Shapes`, `src/utils/Presentation`, `src/utils/Map` | Tạo/load/export shape, geometry, group/table/SVG, motion timeline và chuyển đổi map.                 |
| Backend integration    | `src/apis`                                                    | HTTP client cho report, file, image, render, font, icon, style và target trajectory.                 |
| Validation/type/config | `src/schemes`, `src/types`, `src/configs`                     | Schema AJV, type domain và configuration/runtime constants.                                          |
| Reusable UI            | `src/components`                                              | Input, dialog, tooltip, drag/drop và component MUI dùng chung.                                       |

## Ranh giới ownership và dependency

Mã chia dữ liệu thành hai phía để cấu hình report có thể lưu được nhưng canvas vẫn thao tác trực tiếp với Konva:

| Chủ sở hữu                           | Dữ liệu/đối tượng sở hữu                                                                         | Được phép đi qua export/import                                            | Cách phần khác sử dụng                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `useGlobalStore`                     | Report, tabs, shape config, stage/background/grid/frame config, selection, clipboard và history  | Các object document được export qua helper của store                      | UI gọi action; `Canvas` đọc state và điều phối thay đổi.         |
| Tool stores                          | Config/API của selection rectangle, guide line, eraser, mask và transformer                      | Config được export/import qua object riêng; API runtime không được export | Overlay/transformer đăng ký API khi mount.                       |
| `KonvaShape` components              | `Konva.Node`, `Stage`, `Transformer`, ref và imperative API                                      | Không                                                                     | Gửi API/ref về callback để store/canvas gọi trên node đang sống. |
| `Canvas`                             | Trạng thái interaction tạm thời: pointer, drawing đang diễn ra, context menu và cầu nối callback | Không                                                                     | Chuyển event browser/Konva thành action store hoặc API node.     |
| `utils/Shapes`, `utils/Presentation` | Tạo, load, export, tính geometry/timeline và chạy motion                                         | Chỉ các plain object do helper trả về                                     | Store và layout dùng như lớp domain, không phải React component. |
| `apis`                               | Request/response HTTP                                                                            | Không                                                                     | Dialog/layout gọi khi cần tải hoặc lưu tài nguyên.               |

Quan hệ phụ thuộc chủ đạo là một chiều: layout dùng store và utility; `Canvas` dùng renderer Konva; renderer chỉ trả imperative API ngược qua callback. Renderer không tự ghi document vào API backend, và API backend không biết Konva node. Ranh giới này là lý do một tab có thể được export khi các node Konva hiện tại đã unmount.

## Khởi động và vòng đời editor

1. `src/index.tsx` import bootstrap i18n, stylesheet, tạo React root và bọc `App` bằng `React.StrictMode`.
2. `App` đọc `location.search`. Với `mode=presenter`, nó chỉ dựng `PresenterViewWindow`; các window khác dựng `Editor` trong container chiếm toàn viewport.
3. Ở editor mode, `App` chặn các tổ hợp browser `Ctrl`/`Cmd` + `s`, `i`, `u`, `w`, `-`, `+` và wheel có `Ctrl`/`Cmd`, để các thao tác canvas không bị browser xử lý trước.
4. `Editor` dựng theme, toaster, system bar và các vùng MUI. Kích thước bar trong global store được dùng để tính viewport; hiệu ứng resize/đổi bar gọi `fitStage`.
5. Khi query có `id`, `Editor` lấy metadata report, lấy `json_file_id`, tải JSON file và dùng `addShapes(..., { overwrite: true, syncHistoryBatch: true })` để thay shape của tab active. Lỗi tải được báo bằng toast.
6. `Canvas` mount `KonvaStage`, nhận `Stage` API qua callback, dựng bốn layer theo thứ tự cố định và đăng ký các API/ref runtime. Khi unmount, các callback cùng store xóa ref tương ứng.

Việc tải report ở bước 5 chỉ nạp shape JSON theo flow hiện có của `Editor`; nó không phải một import đầy đủ các object tool như import file từ TopBar.

## Canvas và Konva layer

`Canvas` đặt `KonvaStage` làm root và tách nội dung thành bốn layer có trách nhiệm rõ ràng:

| Layer          | Component           | Nội dung                                                                                                      | Tương tác                                                |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `non-interact` | `CanvasNonInteract` | `KonvaBackground`, `KonvaGrid`, `KonvaFrame`                                                                  | `listening={false}`                                      |
| Shape          | `CanvasShapes`      | Shape của `tabs[activeIndex].shapes`                                                                          | Select, edit, crop, drag, transform, cell/symbol control |
| `interact`     | `CanvasInteract`    | Sáu `KonvaTransformer`: cropper, selector, single-selector, cell-selector, element-selector, control-selector | Có tương tác                                             |
| `overlay`      | `CanvasOverlay`     | Selection rectangle, guide lines, eraser, mask                                                                | `listening={false}`                                      |

Các component Konva mount API/node runtime và callback của canvas đăng ký chúng vào store. Stage được giữ riêng bằng `setStageShapeRef`; các `Konva.Shape` còn lại được đăng ký theo id và API được đọc từ node bằng helper `get…API`. Node control/crop/cell/symbol element dùng cùng registry runtime. Khi unmount, callback xóa ref tương ứng. Runtime ref không nằm trong document export.

### Trình tự mount trong canvas

`Canvas` render các child của `KonvaStage` đúng thứ tự dưới đây. Thứ tự có ý nghĩa render: phần nền nằm dưới shapes, transformer nằm trên shapes và overlay nằm trên cùng.

```text
KonvaStage
  1. CanvasNonInteract
       Background, Grid, Frame → đăng ký API nền/lưới/frame
  2. CanvasShapes
       mỗi shape → đăng ký Shape API + ref control/crop/cell/SVG element
  3. CanvasInteract
       cropper, selector, single-selector, cell-selector,
       element-selector, control-selector → đăng ký Transformer API
  4. CanvasOverlay
       selection rectangle, guide lines, eraser, mask → đăng ký overlay API
```

Khi `activeIndex` thay đổi và không có shape nào được chọn, `Canvas` gọi `exportStageImages` cho chính tab active với `viewport: true` và timeout `RENDER_IMAGE_TIMEOUT`, sau đó ghi ảnh vào `tabs[activeIndex].preview`. Preview này là ảnh runtime tạo từ stage và được Slideshow/Presenter sử dụng làm metadata tab.

`KonvaStage` có hai chế độ surface:

- `followMap`: tạo và đồng bộ MapLibre phía sau Konva. Translate/scale stage được chuyển thành pan/zoom map; style, center và zoom map nằm trong `KonvaS`.
- Các chế độ còn lại: `KonvaBackground` hiển thị nền màu hoặc ảnh tĩnh theo kích thước content stage.

Tài liệu chi tiết về props, API và node runtime của toàn bộ renderer nằm trong [KonvaShape README](src/components/KonvaShape/README.md).

## State và vòng đời dữ liệu

`useGlobalStore` là nguồn state chính của editor. Nó giữ metadata report, list tab, tab active, `stage`, `background`, `grid`, `frame`, shapes, selection, dialog flags và shape history. Mỗi tab giữ `shapes`, stage/layer configuration, `transition`, `preview` và history riêng.

Các store phụ tách state tool/runtime khỏi global document:

- `useDrawingStore`: drawing mode hiện tại.
- `useGlobalStore` cũng giữ config/API runtime của eraser, mask, guide lines, selection rectangle và transformer theo id.
- `useMotionStore`: preview motion trong editor.
- `usePresentationStore`: slide/step runtime khi trình chiếu.

Một tab là đơn vị document độc lập: ngoài `shapes`, tab còn giữ configuration stage/layer, `transition`, `preview` và history shape của riêng nó. `activeIndex` quyết định tab mà action không truyền index sẽ thao tác. Vì vậy các action Canvas thường dùng index mặc định này, còn API export/preview có thể nhận mảng tab index để thao tác nhiều tab.

Luồng thay đổi shape thông thường:

```text
UI / pointer event
  → action trong useGlobalStore
  → KonvaShapeAPI cập nhật node live
  → shape live được đồng bộ về tabs[activeIndex].shapes
  → lastShapesUpdate + selection/history được cập nhật
  → React subscriber render lại panel/canvas cần thiết
```

History shape nằm riêng theo từng tab. `storeShapesHistory` clone toàn bộ danh sách shape live thành một snapshot khi option yêu cầu sync ngay hoặc batch debounce; capture sau undo cắt redo branch và trim các entry cũ theo `maxHistory`. Shape live có thể được mutate tại chỗ nhưng không dùng chung object với snapshot history, và batch đang chờ luôn được commit trước undo/redo. Stage/background/grid/frame không thuộc history shape này.

`lastShapesUpdate` là tín hiệu để các consumer runtime biết config shape đã đổi; hook motion dùng nó để dựng lại timeline/runner. Selection và ref node là state phiên làm việc: chúng phục vụ transformer, marquee, crop hoặc panel hiện tại, nhưng không phải dữ liệu report được lưu.

Tài liệu đầy đủ về store, selection, history, import/export và các điều kiện runtime API nằm trong [stores README](src/stores/README.md).

## Document, runtime và serialization

Document public được tạo từ `GlobalStore` và các object Konva plain như `KonvaShape`, `KonvaS`, `KonvaB`, `KonvaG`, `KonvaF`. `exportGlobalObject` export shape/stage/layer qua helper export rồi bỏ những runtime field được implementation liệt kê; `loadGlobalObject` tạo lại shape/layer và history từ object đã load.

Không serialize các giá trị sau như document data:

- Konva node/API, `Map`, `CanvasImageSource`, `Konva.Animation`, DOM element và callback.
- `nodes` map nội bộ component, API registration map trong store.
- State selection/edit/crop, timestamp update, dialog state và clipboard shape runtime, trừ khi action export hiện tại xử lý cụ thể khác đi.

Các schema ở `src/schemes` mô tả/kiểm tra common data, shape, stage, tab, global object, import/export và tool option. Type domain nằm trong `src/types`; type renderer nằm trong `src/components/KonvaShape/Types.ts`.

## Interaction, drawing và selection

`Canvas` là nơi ghép interaction với store. Nó xử lý pointer trên stage, phím tắt, clipboard, drop file/text/image, drawing mode, marquee selection, group/table operations, crop và shape command. `CanvasShapes` đăng ký callback của từng renderer để:

- Đồng bộ `KonvaShapeAPI` và ref node với `useGlobalStore`.
- Cập nhật selection shape, single-shape, control, cell table và SVG element.
- Đồng bộ drag/transform/edit về `tabs[activeIndex].shapes` và history.
- Cập nhật guide-line snap, eraser/mask/crop overlay và transformer cần thiết.

Shape configuration hỗ trợ basic geometry, media, SVG/symbol, table cell, free-drawing, complex path, custom arrow, fill/stroke/filter/shadow, group metadata và motion. Các shape renderer không tự giữ document; chúng nhận config từ store và công bố API live trở lại canvas/store.

### Phím tắt và reset interaction

Các hotkey được đăng ký trực tiếp trong `Canvas`:

| Tổ hợp                       | Action                             |
| ---------------------------- | ---------------------------------- |
| `Ctrl`/`Cmd` + `G`           | Group selection                    |
| `Ctrl`/`Cmd` + `Shift` + `G` | Ungroup selection                  |
| `Delete`                     | Xóa selection                      |
| `Ctrl`/`Cmd` + `X`, `C`, `V` | Cut, copy, paste                   |
| `Ctrl`/`Cmd` + `D`           | Duplicate tại vị trí pointer stage |

`RESET_INTERACTION_EVENT` có tên event `reset-interaction`. `TopBar/Close` dispatch event này, còn `Canvas` lắng nghe nó và gọi handler reset interaction. Context menu chỉ xuất hiện khi có shape/cell được chọn hoặc clipboard shape có dữ liệu; các nút group/ungroup và thao tác cell được quyết định từ `getSelectedInfo()`.

Luồng reset ưu tiên dừng trạng thái đang thao tác trước khi trở về selection bình thường: drawing đang chạy, edit/crop, control selection, cell selection, SVG/symbol element selection và single selection đều được canvas/store xử lý như các state riêng. Do đó code mới không nên chỉ xóa `selectedIds` để kết thúc một tool mode.

## Presentation và motion

`usePresentationStore` theo dõi `isPresenting`, tab/slide index, `presentationStep`, tổng click step và presenter view. `Canvas` dùng `usePresentationMotions` để chạy effect theo motion definitions đã lưu trên shape.

`Slideshow` ẩn UI chrome bằng cách lưu/đặt lại kích thước bar khi vào/ra trình chiếu. Nó điều khiển slide, click step, pointer modes (laser, pen, highlighter, eraser) và slide transition. Khi presenter view bật, slideshow mở popup với `?mode=presenter` và trao đổi command/sync data qua `BroadcastChannel`; `PresenterViewWindow` chỉ nhận metadata tab (`title`, `note`, `preview`) cùng slide/step hiện tại.

`useMotionStore` là preview trong editor, độc lập với presentation runtime. Nó giữ start time, current time và tùy chọn target shape id.

### Motion runner và protocol presenter

`usePresentationMotions` lấy motion config từ shape đã lưu (`getShapes(undefined, true)`), dựng timeline bằng `buildTimeline`, rồi tạo runner. Runner lấy node thật từ `getShapeAPI(id)?.getNode()` chỉ tại thời điểm phát. Khi trình chiếu:

1. `slideIndex` được chặn trong phạm vi tabs và đồng bộ về `activeIndex`.
2. Khi slide thực sự đổi, hook gọi `doShapes(undefined)` để đưa node về base shape trước khi phát motion của slide mới.
3. Hook tính tổng click step từ timeline và ghi vào presentation store.
4. Khi `presentationStep` tăng, runner phát tuần tự tới step đích; khi step giảm, hook reset về base shape rồi `seekTo` step đích.
5. Khi bật/tắt presentation hoặc timeline đổi, runner cũ bị `destroy()` và được dựng lại.

Slideshow lắng nghe `presentation-click` do `Canvas` dispatch khi người dùng click stage trong presentation mode; event đó chuyển sang `nextPresentationStep`. Bàn phím slideshow: `Escape` thoát, `Space`/`Enter`/mũi tên phải/xuống đi tiếp, mũi tên trái/lên quay slide trước. Popup presenter giao tiếp qua `BroadcastChannel` tên `khqs-presenter`; command gồm `nextSlide`, `prevSlide`, `nextStep`, `setSlide`, `exit`, `requestSync`, và dữ liệu đồng bộ chứa danh sách metadata tab, `slideIndex`, `presentationStep`.

## API và cấu hình runtime

Các module `src/apis` chia theo resource:

- `report`: create/search/get/update/delete report.
- `file`: upload/update/delete/download file.
- `image`: create/search/delete image.
- `render`: PDF, SVG, style JSON và frame render.
- `font`, `icon`, `style`, `targetTrajectory`: resource chuyên biệt.

Mọi module gọi request bằng Axios thông qua `requestToURL`; response 2xx trừ `204` được xem là thành công. URL runtime được đọc từ `window` trong `src/configs/config.ts`, có fallback local:

| Global browser value   | Fallback                                    | Dùng cho                           |
| ---------------------- | ------------------------------------------- | ---------------------------------- |
| `IMAGE_PROCESS_URL`    | `http://localhost:8080`                     | Render API và style JSON API.      |
| `IMAGE_STORAGE_URL`    | `http://localhost:8001`                     | Report, file và image API.         |
| `COLLAB_KONVA_WS`      | `ws://localhost:8386`                       | Yjs WebSocket demo collaboration.  |
| `MAP_STYLE_DEFAULT`    | `https://demotiles.maplibre.org/style.json` | Default MapLibre style.            |
| `RENDER_IMAGE_TIMEOUT` | `5000`                                      | Timeout liên quan image rendering. |

Các global này phải được gán trước khi module config được import nếu deployment cần endpoint/style khác fallback.

### Import, save và event nội bộ

TopBar IO phân tách rõ ba entry point:

- Export và cloud import chỉ bật các cờ `exportReport`/`importReport` trong global store để dialog tương ứng xử lý.
- Import từ thiết bị nhận file app/json, đọc blob thành text, `JSON.parse`, validate bằng `importExportSchema`, rồi lần lượt load `global`, selection rectangle, guide lines, eraser, mask và transformers. Lỗi parse/validate/load được bắt và hiển thị toast.
- Save không có `fileId` sẽ mở Save As. Có `fileId`, `TopBarIO` dispatch `SAVE_EVENT` (`save`); `SaveAsDialog` lắng nghe event và thực hiện save handler. Đây là contract event giữa toolbar và dialog, không phải HTTP call ngay trong `TopBarIO`.

## Giao diện, i18n và theme

`AppTheme` lấy `themeMode` từ global store và palette surface từ `src/configs`. i18next được khởi tạo trong `src/index.tsx`; bản dịch hiện nằm ở `src/locales/vietnamese/translation.json` và `src/locales/english/translation.json`. Dialog flags trong global store quyết định dialog được render/mở trong `layouts/Dialog`.

## Cấu trúc thư mục

```text
src/
├─ apis/          HTTP resource modules
├─ components/    reusable UI và Konva renderer
├─ configs/       runtime URL, events, theme/color constants
├─ demos/         demo độc lập, không phải entry editor chính
├─ hooks/         React hook dùng chung
├─ layouts/       editor shell, canvas, bars, dialogs, slideshow
├─ locales/       i18next bootstrap và translation files
├─ schemes/       AJV validation schema
├─ stores/        Zustand document/tool/presentation state
├─ types/         domain type dùng chung
└─ utils/         shape, map, image, request, presentation và helper khác
```

## Quy ước khi mở rộng

- Thay đổi document shape/tab/stage qua store action để timestamp, selection, history và runtime API được đồng bộ.
- Giữ configuration exportable là plain object; giữ Konva/DOM/Map instance trong ref/API runtime.
- Khi thêm shape renderer, khai báo type/API, export từ `KonvaShape/index.ts`, gắn lifecycle callback và thêm renderer vào `CanvasShapes`.
- Khi thêm overlay/layer, giữ đúng ranh giới layer `non-interact`, shape, `interact`, `overlay` và đăng ký API vào store tương ứng.
- Khi thêm field document, cập nhật schema, loader/exporter trong `utils/Shapes`, store type/action và tài liệu liên quan.
