import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { optimize } from "svgo";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const inputDirectory = path.join(
  projectRoot,
  "public",
  "assets",
  "icons",
  "data",
  "input"
);
const outputFile = path.join(
  projectRoot,
  "public",
  "assets",
  "icons",
  "data",
  "output",
  "out.json"
);

const iconTitles = {
  CB_Bezier: "Đường cong Bézier",
  CB_Doancong: "Đoạn cong",
  CB_Doangapkhuc: "Đoạn gấp khúc",
  CB_Doansongsong: "Đoạn song song",
  CB_Doanthang: "Đoạn thẳng",
  CB_Hinhchunhat: "Hình chữ nhật",
  CB_Hinhdagiac: "Hình đa giác",
  CB_Hinhelip: "Hình elip",
  CB_Hinhthoi: "Hình thoi",
  CB_Hinhtron: "Hình tròn",
  CB_Text: "Văn bản",
  MT_MessageBox: "Hộp thông điệp",
  MT_MessageBoxNoFill: "Hộp thông điệp không nền",
  MT_Muiten1dau_lien_thang: "Mũi tên 1 đầu nét liền thẳng",
  MT_Muiten1dau_netdut_thua: "Mũi tên 1 đầu nét đứt thưa cong",
  MT_Muiten1dau_netdut__vua_thang: "Mũi tên 1 đầu nét đứt vừa thẳng",
  MT_Muiten1dau_netdu_mau_cong: "Mũi tên 1 đầu nét đứt mau cong",
  MT_Muiten1dau_netdu_mau_thangsvg: "Mũi tên 1 đầu nét đứt mau thẳng",
  MT_Muiten1dau_netdu_thua_thang: "Mũi tên 1 đầu nét đứt thưa thẳng",
  MT_Muiten1dau_netdu_vua_cong: "Mũi tên 1 đầu nét đứt vừa cong",
  MT_Muiten1dau_netline_cong: "Mũi tên 1 đầu nét liền cong",
  MT_Muiten2dau_dut_mau_cong: "Mũi tên 2 đầu nét đứt mau cong",
  MT_Muiten2dau_dut_mau_thang: "Mũi tên 2 đầu nét đứt mau thẳng",
  MT_Muiten2dau_dut_thua_cong: "Mũi tên 2 đầu nét đứt thưa cong",
  MT_Muiten2dau_dut_thua_thang: "Mũi tên 2 đầu nét đứt thưa thẳng",
  MT_Muiten2dau_dut_vua_cong: "Mũi tên 2 đầu nét đứt vừa cong",
  MT_Muiten2dau_dut_vua_thang: "Mũi tên 2 đầu nét đứt vừa thẳng",
  MT_Muiten2dau_lien_cong: "Mũi tên 2 đầu nét liền cong",
  MT_Muiten2dau_lien_thang: "Mũi tên 2 đầu nét liền thẳng",
  MT_Muitendahuong: "Mũi tên đa hướng",
  MT_Muitendon: "Mũi tên đơn",
  MT_Muitentudo: "Mũi tên tự do",
  MT_PolygonSmooth: "Đa giác trơn",
};

function minifySVG(svg, filePath) {
  const removableSVGAttrs = ["svg|x|0", "svg|y|0"];

  // xml:space có thể làm thay đổi khoảng trắng hiển thị trong text/tspan.
  if (!/<(?:text|tspan)\b/i.test(svg)) {
    removableSVGAttrs.push("svg|xml:space|preserve");
  }

  return optimize(svg, {
    path: filePath,
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            // Inline toàn bộ class CSS để có thể bỏ thẻ style sau khi tối ưu.
            inlineStyles: { onlyMatchedOnce: false },
            // Bỏ các phần tử không có fill và stroke, ví dụ class .st4.
            removeUselessStrokeAndFill: { removeNone: true },
          },
        },
      },
      // `viewBox` vẫn giữ nguyên kích thước/tỉ lệ khi bỏ width và height.
      "removeDimensions",
      {
        name: "removeAttrs",
        // Dùng `|` vì tên thuộc tính xml:space đã chứa dấu `:`.
        params: { elemSeparator: "|", attrs: removableSVGAttrs },
      },
    ],
  }).data;
}

function createGroupKey(directoryName) {
  return directoryName
    .replace(/[đĐ]/g, (character) => (character === "đ" ? "d" : "D"))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function createIconTitle(name) {
  if (iconTitles[name]) {
    return iconTitles[name];
  }

  const title = name
    .replace(/^[A-Z0-9]+_/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_+/g, " ")
    .trim();

  return title.charAt(0).toUpperCase() + title.slice(1);
}

async function getDirectoryEntries(directory) {
  return (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name, "vi")
  );
}

async function createIcon(svgEntry, groupDirectory) {
  const filePath = path.join(groupDirectory, svgEntry.name);
  const name = path.parse(svgEntry.name).name;
  const svg = await fs.readFile(filePath, "utf8");

  return {
    name,
    content: minifySVG(svg, filePath),
    title: createIconTitle(name),
  };
}

async function generateIconJson() {
  const result = {};
  const groupEntries = (await getDirectoryEntries(inputDirectory)).filter(
    (entry) => entry.isDirectory()
  );

  for (const groupEntry of groupEntries) {
    const groupKey = createGroupKey(groupEntry.name);
    if (!groupKey) {
      throw new Error(`Không thể tạo key cho thư mục: ${groupEntry.name}`);
    }
    if (result[groupKey]) {
      throw new Error(`Trùng key nhóm: ${groupKey}`);
    }

    const groupDirectory = path.join(inputDirectory, groupEntry.name);
    const svgEntries = (await getDirectoryEntries(groupDirectory)).filter(
      (entry) =>
        entry.isFile() && path.extname(entry.name).toLowerCase() === ".svg"
    );

    result[groupKey] = {
      title: groupEntry.name,
      svgs: await Promise.all(
        svgEntries.map((entry) => createIcon(entry, groupDirectory))
      ),
    };
  }

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(
    outputFile,
    `${JSON.stringify(result, null, 2)}\n`,
    "utf8"
  );

  const iconCount = Object.values(result).reduce(
    (total, group) => total + group.svgs.length,
    0
  );
  console.log(
    `Đã tạo ${path.relative(projectRoot, outputFile)} (${groupEntries.length} nhóm, ${iconCount} SVG).`
  );
}

generateIconJson().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
