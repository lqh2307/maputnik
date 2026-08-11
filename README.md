<img width="200" alt="Maputnik logo" src="https://cdn.jsdelivr.net/gh/maputnik/design/logos/logo-color.png" />

# Maputnik

[![GitHub CI status](https://github.com/maplibre/maputnik/workflows/ci/badge.svg)][github-action-ci]
[![License](https://img.shields.io/badge/license-MIT-blue.svg)][license]

[github-action-ci]: https://github.com/maplibre/maputnik/actions?query=workflow%3Aci
[license]: https://tldrlegal.com/license/mit-license

A free and open visual editor for the [MapLibre GL styles](https://maplibre.org/maplibre-style-spec/)
targeted at developers and map designers.

## Usage

- :link: Design your maps online at **<https://www.maplibre.org/maputnik/>** (all in local storage)
- :link: Use the [Maputnik CLI](https://github.com/maplibre/maputnik/wiki/Maputnik-CLI) for local style development
- In a Docker, run this command and browse to http://localhost:8888, Ctrl+C to stop the server.

```bash
docker run -it --rm -p 8888:8000 ghcr.io/maplibre/maputnik:main
```

To see the CLI options (for example file watching or style serving) run:

```bash
docker run -it --rm -p 8888:8000 ghcr.io/maplibre/maputnik:main --help
```

You might need to mount a volume (`-v`) to be able to use these options.

## Documentation

The documentation can be found in the [Wiki](https://github.com/maplibre/maputnik/wiki). You are welcome to collaborate!

- :link: **Study the [Maputnik Wiki](https://github.com/maplibre/maputnik/wiki)**
- :video_camera: Design a map from Scratch https://youtu.be/XoDh0gEnBQo

[![Design Map from Scratch](https://j.gifs.com/g5XMgl.gif)](https://youtu.be/XoDh0gEnBQo)

## Kiến trúc và luồng hoạt động

Phần này mô tả cách phiên bản ứng dụng trong repository này được khởi tạo,
tổ chức và đồng bộ dữ liệu. Maputnik là một single-page application chạy hoàn
toàn trong trình duyệt. Ứng dụng không cần backend riêng để chỉnh sửa style:
style đang làm việc nằm trong React state, được tự động lưu vào `localStorage`
và có thể được nhập/xuất dưới dạng JSON. TileJSON, vector/raster tile, glyph,
sprite và dịch vụ tìm kiếm địa điểm vẫn được tải trực tiếp từ các URL bên ngoài
được cấu hình trong style.

### Bức tranh tổng thể

```text
+----------------------------- TRINH DUYET ------------------------------+
|                                                                        |
|  public/index.html                                                     |
|       |                                                                |
|       +--> public/config.js --> window.MAPUTNIK_CONFIG (API tokens)     |
|       |                                                                |
|       `--> src/index.jsx --> i18n + SCSS --> <App/>                     |
|                                           |                            |
|                    +----------------------+----------------------+     |
|                    |       App: state va orchestration           |     |
|                    |  mapStyle, selection, errors, mapView,      |     |
|                    |  renderer, modals, debug options            |     |
|                    +----+----------------+-------------------+----+     |
|                         |                |                   |          |
|                  AppLayout        Dich vu noi bo         Style spec     |
|                         |                |                   |          |
|       +-----------------+------+   +-----+---------+   validate/format  |
|       |        |        |      |   |     |         |                   |
|    Toolbar  LayerList  Editor  Map  Style Revision Layer               |
|                       / Code        Store  Store    Watcher              |
|       |        |        |      |     |      |        |                  |
|       `--------+--------+------+-----+------+--------'                  |
|                         |              |                                |
|                  onStyleChanged()   localStorage                        |
|                         |                                               |
|                         `--> render lai UI va map                       |
|                                                                        |
+------------------------------+-----------------------------------------+
                               |
             +-----------------+----------------------------+
             |                 |             |              |
         TileJSON/tiles     glyph/sprite   PMTiles       Nominatim
                  (cac dich vu du lieu ben ngoai, CORS)
```

Ba nguyên tắc chính của kiến trúc:

1. `App` là nguồn dữ liệu trung tâm. Project không dùng Redux; các component
   nhận dữ liệu và callback qua props.
2. Mọi thao tác làm thay đổi style cuối cùng đều đi qua
   `App.onStyleChanged()`. Đây là điểm chung để validate, tạo revision, lưu
   cục bộ, cập nhật URL và render lại bản đồ.
3. UI chỉnh style theo MapLibre Style Specification v8. Phần lớn form paint và
   layout không được viết cứng từng kiểu input mà được sinh từ style spec.

### Cây component và bố cục màn hình

```text
App
`-- AppLayout
    |-- AppToolbar
    |   |-- Open / Save / Code Editor / Data Sources / Style Settings
    |   |-- Global State
    |   `-- View (Map | Inspect) / Language / Help
    |
    |-- Main
    |   |-- LayerList
    |   |   |-- LayerListGroup
    |   |   |-- LayerListItem (chon, an/hien, copy, xoa, drag/drop)
    |   |   `-- ModalAdd
    |   |
    |   |-- LayerEditor                 [che do form]
    |   |   |-- Layer (id, type, source, source-layer, zoom, comment)
    |   |   |-- FilterEditor
    |   |   |-- PropertyGroup[] (paint/layout sinh tu style spec)
    |   |   `-- FieldJson (JSON cua mot layer)
    |   |
    |   |-- CodeEditor                  [thay cho LayerList + LayerEditor]
    |   |   `-- InputJson (JSON cua toan bo style)
    |   |
    |   `-- Map renderer
    |       |-- MapMaplibreGl           [mac dinh]
    |       `-- MapOpenLayers           [thu nghiem]
    |
    |-- AppMessagePanel (loi validation va thong bao undo/redo)
    |
    `-- Modals
        |-- ModalOpen / ModalExport / ModalSources / ModalSettings
        |-- ModalGlobalState / ModalDebug / ModalShortcuts
        `-- ModalLoading
```

`AppLayout` chỉ quyết định bố cục. Khi Code Editor mở, cột danh sách layer và
Layer Editor được thay bằng trình sửa JSON toàn bộ style; bản đồ vẫn được giữ ở
bên cạnh. Các modal được render cùng cây component nhưng trạng thái mở/đóng do
`App.state.isOpen` quản lý.

### State trung tâm

| Nhóm state | Vai trò |
| --- | --- |
| `mapStyle` | Bản style chuẩn mà người dùng đang chỉnh; luôn có `id` nội bộ. |
| `dirtyMapStyle` | Bản sao chỉ dùng để render khi style có lỗi; các đường dẫn thuộc tính gây lỗi bị loại khỏi bản sao để renderer vẫn hoạt động. |
| `selectedLayerIndex`, `selectedLayerOriginalId` | Xác định layer đang chọn; `selectedLayerOriginalId` còn được dùng làm React `key` để reset state nội bộ của editor khi đổi layer. |
| `sources` | Source trong style cộng thêm danh sách `vector_layers` lấy từ TileJSON/PMTiles. |
| `vectorLayers` | Tên field và các giá trị đã quan sát được từ feature trong vector tile, dùng để hỗ trợ sửa filter/data-driven property. |
| `spec` | MapLibre style spec mới nhất, được bổ sung danh sách font và sprite tải được. |
| `mapView` | `zoom`, `center` và cờ `_from` để phân biệt thay đổi đến từ map hay từ app, tránh cập nhật vòng lặp. |
| `mapState` | Chế độ `map` hoặc `inspect`. Inspect chỉ dùng với MapLibre GL. |
| `errors`, `infos` | Lỗi style đã ánh xạ đến layer/property và thông báo mô tả undo/redo. |
| `isOpen` | Trạng thái các modal và Code Editor. |
| `fileHandle` | File handle gần nhất khi trình duyệt hỗ trợ File System Access API, giúp thao tác Save ghi lại đúng file. |

Các object/array style thường được cập nhật theo kiểu immutable: component tạo
bản sao layer, `layers`, `sources` hoặc object cấp gốc rồi gửi lên callback.
Nhờ vậy React nhận biết thay đổi và MapLibre có thể diff style cũ/mới.

### Luồng khởi động

```text
Tai public/index.html
        |
        +--> nap public/config.js (token co the thay ma khong rebuild)
        |
        `--> src/index.jsx
              |-- nap SCSS
              |-- khoi tao i18next + browser language detector
              `-- createRoot(#app).render(<App/>)
                                |
                                v
                    App khoi tao emptyStyle
                                |
                     componentDidMount()
                                |
                    createStyleStore(callback)
                                |
          +---------------------+-----------------------+
          |                                             |
 URL co ?style=<url> va user dong y?              Khong / tu choi
          |                                             |
 fetch JSON qua CORS                         localStorage co style?
          |                                      |             |
          |                                     co            khong
          |                                      |             |
          +----------------------------> style gan nhat    style gallery[0]
                                                 |         (fetch default)
                                                 +-------------+
                                                               |
                                      ensureStyleValidity / fallback
                                                               |
                              onStyleChanged(initialLoad=true, save=false)
                                                               |
                              khoi phuc layer/modal/view tu URL
                                                               |
                                     validate + setState + render map
```

Chi tiết các bước:

1. `public/config.js` chạy trước bundle và gán token runtime vào
   `window.MAPUTNIK_CONFIG`. `src/config/runtime.ts` đọc object này khi module
   được nạp.
2. `src/index.jsx` nạp stylesheet, khởi tạo i18n, render `App` và ẩn loading
   screen tĩnh.
3. `App` bắt đầu bằng `emptyStyle`, tạo `RevisionStore`, `LayerWatcher` và đăng
   ký phím tắt.
4. `createStyleStore()` ưu tiên URL `?style=...` nếu người dùng xác nhận. Tham
   số này được xóa khỏi address bar sau khi đọc. Nếu không, app lấy style sửa
   gần nhất từ `localStorage`; khi chưa có dữ liệu, app tải style đầu tiên trong
   `src/config/styles.json`.
5. `ensureStyleValidity()` thêm `id` nếu thiếu, bỏ thuộc tính `interactive` cũ
   và dereference các layer dùng `ref`.
6. Lần gọi `onStyleChanged()` đầu tiên không ghi ngược style xuống
   `localStorage`, nhưng tạo revision đầu tiên và khôi phục trạng thái giao diện
   từ query string.

### Pipeline thay đổi style

Đây là luồng quan trọng nhất của ứng dụng. Thêm/xóa/sắp xếp layer, chỉnh form,
sửa JSON, thay source, settings hay global state đều hội tụ vào cùng pipeline.

```text
Thao tac nguoi dung
        |
        v
Component con tao layer/style moi
        |
        | onLayerChanged / onLayersChange / onStyleChanged
        v
+--------------------- App.onStyleChanged(newStyle, opts) ----------------+
| 1. Tron opts mac dinh: save=true, addRevision=true                      |
| 2. Dien API key vao glyph/sprite/source URL can dung de fetch           |
| 3. Neu initial load: doc layer, modal, view tu URL                      |
| 4. validateStyleMin(newStyle)                                           |
| 5. Chuyen loi thanh {layer index, property, message} neu co the          |
| 6. Neu co loi: clone style va bo property loi khoi ban render tam        |
| 7. Neu glyph/sprite doi: tai metadata font/icon de bo sung cho form      |
| 8. Them snapshot vao RevisionStore                                      |
| 9. Luu style vao StyleStore/localStorage                                |
| 10. setState(mapStyle, dirtyMapStyle, errors, mapView)                   |
+-----------------------------------+--------------------------------------+
                                    |
                         callback sau setState
                                    |
                   +----------------+----------------+
                   |                                 |
             fetchSources()                   setStateInUrl()
                   |                                 |
       TileJSON/PMTiles.vector_layers       layer/modal/view params
                   |
                   v
              React render lai
                   |
       +-----------+------------------+
       |                              |
 MapLibre: setStyle(diff=true)   OpenLayers: clear + apply(style)
```

Điểm cần lưu ý là `mapStyle` vẫn giữ đúng nội dung người dùng vừa nhập, kể cả
khi nội dung đó chưa hợp lệ. Lỗi được hiển thị ở `AppMessagePanel` và sát field
tương ứng trong `LayerEditor`. Chỉ `dirtyMapStyle` dùng cho map renderer bị bỏ
tạm các property lỗi. Khi người dùng sửa hợp lệ, `dirtyMapStyle` biến mất và
renderer nhận lại toàn bộ `mapStyle`.

#### Ví dụ luồng sửa một paint property

```text
InputColor / InputNumber / ...
        -> FieldFunction
        -> PropertyGroup.onPropertyChange("fill-color", value)
        -> LayerEditor.changeProperty("paint", "fill-color", value)
        -> libs/layer.changeProperty(...)
        -> App.onLayerChanged(index, changedLayer)
        -> App.onLayersChange(changedLayers)
        -> App.onStyleChanged(changedStyle)
        -> validate + revision + localStorage + map.setStyle(...)
```

`LayerEditor` đọc các nhóm `paint_<type>` và `layout_<type>` từ package
`@maplibre/maplibre-gl-style-spec`. `PropertyGroup` tạo một `FieldFunction` cho
mỗi property. `FieldFunction` nhận biết giá trị hiện tại là giá trị tĩnh,
zoom/data function hay expression; `InputSpec` sau đó chọn input nguyên thủy
phù hợp như number, color, boolean, enum, string, array, font hoặc autocomplete.
Vì vậy khi mở rộng editor, nên đi theo chuỗi `style spec` -> `FieldFunction` ->
`InputSpec` thay vì tạo form độc lập cho từng paint/layout property.

### Layer, source và dữ liệu hỗ trợ editor

```text
Style.sources
     |
     +--> source co URL TileJSON --------> fetch JSON.vector_layers
     |
     +--> source pmtiles:// -------------> PMTiles.getTileJson()
     |
     `--> renderer tai tile
               |
               `-- event "data" (tile)
                        |
                        v
                 LayerWatcher.analyzeMap()
                        |
             throttle toi da 1 lan / 5 giay
                        |
              querySourceFeatures(sourceId)
                        |
                        v
          vectorLayers[layer][property][observedValue]
                        |
                        `--> goi y cho FilterEditor/data property
```

- `LayerList` hiển thị layer theo thứ tự trong `style.layers`, nhóm các layer
  liền kề theo prefix của ID, hỗ trợ drag/drop, copy, xóa và visibility.
- `ModalAdd` lọc source phù hợp theo loại layer. Ví dụ `raster` chỉ nhận raster
  source, `hillshade`/`color-relief` nhận `raster-dem`, còn các layer vector
  nhận vector hoặc GeoJSON source. Layer mới được nối vào cuối mảng.
- `ModalSources` cho phép sửa source hiện tại, lấy source mẫu từ
  `src/config/tilesets.json` hoặc tạo GeoJSON, vector, raster, raster-dem,
  PMTiles, image và video source.
- `App.fetchSources()` đọc danh sách layer từ TileJSON hoặc metadata PMTiles để
  điền lựa chọn `source-layer` ngay cả trước khi tile được render.
- `LayerWatcher` quan sát các tile MapLibre đã tải và lấy field/value thực tế từ
  feature. Công việc này được throttle 5 giây vì `querySourceFeatures()` có thể
  tốn chi phí trên bản đồ lớn.

### Hai renderer

Renderer được chọn bởi `mapStyle.metadata["maputnik:renderer"]`; mặc định là
`mlgljs`.

| Khả năng | `MapMaplibreGl` | `MapOpenLayers` |
| --- | --- | --- |
| Áp dụng style | `map.setStyle(style, {diff: true})` | Xóa layer rồi gọi `ol-mapbox-style.apply()` (throttle 200 ms) |
| Inspect feature/layer | Có, dùng `@maplibre/maplibre-gl-inspect` | Không; lựa chọn Inspect bị disable |
| PMTiles | Đăng ký protocol `pmtiles://` | Phụ thuộc khả năng của `ol-mapbox-style` |
| Tiện ích map | Geocoder Nominatim, zoom và navigation control, popup chọn layer | Tọa độ/trạng thái map và debug toolbox |
| Thu thập vector fields | Có qua `LayerWatcher` trên event tile data | Không gọi `LayerWatcher` theo luồng hiện tại |

Trước khi truyền style cho renderer, `replaceAccessTokens()` thay placeholder
`{key}` bằng token. Token trong metadata của style được ưu tiên; token runtime
từ `public/config.js` là fallback. Khi MapLibre phát sinh drag/zoom, map gửi
`mapView` lên `App` với `_from: "map"`. Chỉ view có `_from: "app"` mới được
`jumpTo()` ngược xuống map, nhờ đó tránh vòng lặp đồng bộ.

Ở chế độ Inspect, MapLibre tạo một inspect style riêng: bỏ raster source, thêm
background tối và tô màu các vector layer. Click feature ở chế độ Map mở popup
để chọn layer tương ứng trong `LayerList`; ở chế độ Inspect popup hiển thị các
property của feature.

### Lưu, undo/redo và trạng thái trên URL

#### Lưu tự động

`StyleStore` dùng các key sau:

```text
maputnik:style:<style-id>  -> JSON cua style
maputnik:latest_style     -> id cua style duoc sua gan nhat
```

Mỗi lần pipeline chạy với `save=true`, style được chuẩn hóa rồi ghi đè theo
`id`. Nếu quota của `localStorage` đầy, store xóa toàn bộ key có prefix
`maputnik` và thử lưu lại. Đây là lưu trạng thái làm việc, không phải lịch sử
phiên bản lâu dài.

#### Undo/redo

`RevisionStore` giữ mảng snapshot trong bộ nhớ và con trỏ `currentIdx`. Một thay
đổi mới sau undo sẽ cắt bỏ nhánh redo. Undo/redo gọi lại `onStyleChanged()` với
`addRevision=false`, nhưng style được chọn vẫn được lưu làm bản hiện hành trong
`localStorage`. Phím tắt là `Ctrl+Z`/`Ctrl+Y` trên Windows/Linux và
`Cmd+Z`/`Cmd+Shift+Z` trên macOS.

#### Query string

```text
?style=<url>                chi dung luc khoi dong, sau do bi xoa
?layer=<style-hash>~<index> khoi phuc layer dang chon neu hash con khop
?modal=open,sources,...     khoi phuc cac modal dang mo
?view=inspect               khoi phuc che do Inspect
```

`setStateInUrl()` dùng `history.replaceState()`, vì vậy các thay đổi UI không
tạo thêm history entry của trình duyệt. MapLibre đồng thời dùng phần URL hash
cho camera (`hash: true`).
### Nhập và xuất style

```text
IMPORT
  File System Access API ----+
  input file / drag-and-drop -+--> JSON.parse --> ensureStyleValidity
  URL / style gallery --------+       |
                                      `--> App.openStyle()
                                             `--> onStyleChanged()

EXPORT
  mapStyle
     -> replaceAccessTokens()
     -> strip token khoi metadata
     -> style-spec format()
     +--> Save/Save As JSON
     `--> HTML doc doc lap nhung MapLibre GL tu CDN
```

- `ModalOpen` ưu tiên File System Access API khi trình duyệt hỗ trợ, nếu không
  sẽ dùng file input/FileReader. Tải URL và gallery yêu cầu server cho phép
  CORS.
- Khi mở file bằng File System Access API, `fileHandle` được giữ trong `App` để
  nút Save lần sau ghi đúng file; Save As luôn xin handle mới.
- `ModalExport` đưa token cần thiết vào URL của bản xuất nhưng xóa các khóa
  token riêng khỏi `metadata`. Tên file lấy từ slug của `style.name`, fallback
  về `style.id`.

### Tổ chức source code

```text
maputnik/
|-- public/
|   |-- index.html             HTML shell, loading screen, mount point #app
|   |-- config.js              token runtime, co the thay sau khi build
|   `-- assets/                logo, icon, font va static assets
|
|-- src/
|   |-- index.jsx              entry point React
|   |-- i18n.ts                khoi tao i18next, lazy-load translation
|   |
|   |-- components/
|   |   |-- App.tsx            state trung tam va tat ca luong orchestration
|   |   |-- AppLayout.tsx      bo cuc toolbar/list/editor/map/panel/modal
|   |   |-- AppToolbar.tsx     cac action cap app va chon view/ngon ngu
|   |   |-- LayerList*.tsx     danh sach, group, item va drag/drop layer
|   |   |-- LayerEditor*.tsx   editor layer sinh theo MapLibre style spec
|   |   |-- Field*.tsx         wrapper co label, doc, error, function mode
|   |   |-- Input*.tsx         input co ban, khong biet state cap app
|   |   |-- FilterEditor*.tsx  UI tao/sua filter
|   |   |-- Map*.tsx           adapter cho MapLibre GL va OpenLayers
|   |   |-- CodeEditor.tsx     editor JSON toan style
|   |   `-- modals/            open/export/source/settings/debug/add/...
|   |
|   |-- libs/
|   |   |-- store/             StyleStore va factory chon style khoi dong
|   |   |-- style.ts           chuan hoa style va xu ly access token
|   |   |-- layer.ts           ham bien doi layer/property
|   |   |-- source.ts          ham them/sua/xoa source
|   |   |-- revisions.ts       undo/redo trong bo nho
|   |   |-- layerwatcher.ts    thu thap layer/field tu tile da tai
|   |   |-- urlopen.ts         doc style URL va kiem tra URL/protocol
|   |   `-- *.ts               format, filter, metadata, highlight, helper
|   |
|   |-- config/
|   |   |-- styles.json        style gallery
|   |   |-- tilesets.json      public source gallery
|   |   |-- empty-style.json   style rong
|   |   `-- runtime.ts         type va reader cho window.MAPUTNIK_CONFIG
|   |
|   |-- locales/               JSON dich theo ngon ngu
|   `-- styles/                SCSS tach theo layout/component/chuc nang
|
|-- scripts/                   script tao metadata asset
|-- docker/ + Dockerfile       build static bundle va serve bang nginx
|-- deb_template/ + Makefile   dong goi/release Debian va Docker
|-- craco.config.cjs           tuy bien webpack cua Create React App
|-- tsconfig.json              cau hinh TypeScript
`-- package.json               dependencies va npm scripts
```

Quy ước phân lớp có thể hiểu ngắn gọn như sau:

```text
Input*  -> dieu khien HTML/UI co ban
Field*  -> them label, tai lieu spec, validation va che do function/expression
Editor  -> ghep cac Field thanh nghiep vu layer/filter/style
Modal   -> nghiep vu cap style/source/file
App     -> state, side effect va dieu phoi toan ung dung
libs    -> ham thuan/adapter/store co the tai su dung
```

### Điểm mở rộng thường gặp

- Thêm một paint/layout property: trước hết kiểm tra property đã có trong
  MapLibre style spec chưa. Nếu kiểu dữ liệu đã được `InputSpec` hỗ trợ, editor
  thường tự sinh field; chỉ cần code riêng cho UI/behavior đặc biệt.
- Thêm kiểu input: tạo `InputX`, wrapper `FieldX` nếu cần, rồi khai báo nhánh
  chọn tương ứng trong `InputSpec`.
- Thêm thao tác thay đổi style: tạo bản sao immutable và đưa về
  `onStyleChanged()` để không bỏ qua validation, revision và autosave.
- Thêm source mode: cập nhật `EditorMode`, `ModalSources.defaultSource()` và
  `ModalSourcesTypeEditor` cùng nhau.
- Thêm modal cấp ứng dụng: bổ sung key trong `AppState.isOpen`, render modal ở
  `App.render()` và gọi `toggleModal()` từ toolbar/phím tắt. Key modal sẽ tự
  được phản ánh vào query string.
- Thêm chuỗi UI: dùng `t()`/`Trans`, sau đó cập nhật tài nguyên trong
  `src/locales/`; xem hướng dẫn tại `src/locales/README.md`.

### Phím tắt chính

| Phím | Chức năng |
| --- | --- |
| `O` | Open style |
| `E` | Save/Export |
| `D` | Data Sources |
| `S` | Style Settings |
| `G` | Global State |
| `I` | Chuyển Map/Inspect |
| `M` | Focus vào canvas bản đồ |
| `?` | Mở danh sách phím tắt |
| `!` | Debug options |
| `Esc` | Bỏ focus control hiện tại/đưa focus về body |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl + Y` hoặc `Cmd + Shift + Z` | Redo |

## Develop

Maputnik is written in typescript and is using [React](https://github.com/facebook/react) and [MapLibre GL JS](https://maplibre.org/projects/maplibre-gl-js/).

We ensure building and developing Maputnik works with the [current active LTS Node.js version and above](https://github.com/nodejs/Release#release-schedule).

Check out our [Internationalization guide](./src/locales/README.md) for UI text related changes.

### Getting Involved

Join the #maplibre or #maputnik slack channel at OSMUS: get an invite at https://slack.openstreetmap.us/ Read the the below guide in order to get familiar with how we do things around here.

Install the deps, start the dev server and open the web browser on `http://localhost:8888/`.

```bash
# install dependencies
npm install
# start dev server
npm run start
```

If you want Maputnik to be accessible externally, configure the development server host as described in the [Create React App documentation](https://create-react-app.dev/docs/advanced-configuration/):

```bash
# start externally accessible dev server
npm run start -- --host 0.0.0.0
```

The build process will watch for changes to the filesystem, rebuild and autoreload the editor.

```
npm run build
```

Lint the JavaScript code.

```
# run linter
npm run lint
npm run lint-css
npm run sort-styles
```

## Tests

### End-to-end tests

For E2E testing we use [Playwright](https://playwright.dev/). The tests live in the [`e2e`](/e2e) directory and drive the app through the `MaputnikDriver` page object.

The first time you run the tests, install the browser:

```
npx playwright install chromium
```

Playwright automatically starts the dev server (`npm run start`) for you, so you can just run:

```
npm run test
```

Some useful options:

```
# see the tests run in a headed browser
npm run test -- --headed

# run a single spec / filter by title
npm run test -- e2e/map.spec.ts
npm run test -- -g "zoom level"

# open the interactive UI mode
npx playwright test --ui
```

Running the E2E tests also produces a code-coverage report in `coverage/` (collected via istanbul instrumentation of the dev server).

## Release process

1. Review [`CHANGELOG.md`](/CHANGELOG.md)
   - Double-check that all changes included in the release are appropriately documented.
   - To-be-released changes should be under the "main" header.
   - Commit any final changes to the changelog.
2. Once merged, an automatic process will kick in and creates a GitHub release and uploads release assets.

## Sponsors

Thanks to the supporters of the **[Kickstarter campaign](https://www.kickstarter.com/projects/174808720/maputnik-visual-map-editor-for-mapbox-gl)**. This project would not be possible without these commercial and individual sponsors.
You can see this file's history for previous sponsors of the original Maputnik repo.
Read more about the MapLibre Sponsorship Program at https://maplibre.org/sponsors/.

## License

Maputnik is [licensed under MIT](LICENSE) and is Copyright (c) Lukas Martinelli and Maplibre contributors.
As contributor please take extra care of not violating any Mapbox trademarks. Do not get inspired by other map studios and make your own decisions for a good style editor.
