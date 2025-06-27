// GPU 型号列表（官方型号）
const gpuModels = {
  "NVIDIA": [
    // 桌面 GPU
    { name: "GeForce RTX 4090", arch: "Ada Lovelace" },
    { name: "GeForce RTX 4080", arch: "Ada Lovelace" },
    { name: "GeForce RTX 4070 Ti", arch: "Ada Lovelace" },
    { name: "GeForce RTX 4070", arch: "Ada Lovelace" },
    { name: "GeForce RTX 4060 Ti", arch: "Ada Lovelace" },
    { name: "GeForce RTX 4060", arch: "Ada Lovelace" },
    { name: "GeForce RTX 3090 Ti", arch: "Ampere" },
    { name: "GeForce RTX 3090", arch: "Ampere" },
    { name: "GeForce RTX 3080 Ti", arch: "Ampere" },
    { name: "GeForce RTX 3080", arch: "Ampere" },
    { name: "GeForce RTX 3070 Ti", arch: "Ampere" },
    { name: "GeForce RTX 3070", arch: "Ampere" },
    { name: "GeForce RTX 3060 Ti", arch: "Ampere" },
    { name: "GeForce RTX 3060", arch: "Ampere" },
    { name: "GeForce RTX 3050", arch: "Ampere" },
    { name: "GeForce RTX 2080 Ti", arch: "Turing" },
    { name: "GeForce RTX 2080", arch: "Turing" },
    { name: "GeForce RTX 2070", arch: "Turing" },
    { name: "GeForce RTX 2070 Super", arch: "Turing" },
    { name: "GeForce RTX 2060 Super", arch: "Turing" },
    { name: "GeForce RTX 2060", arch: "Turing" },
    { name: "GeForce GTX 1660 Ti", arch: "Turing" },
    { name: "GeForce GTX 1660 Super", arch: "Turing" },
    { name: "GeForce GTX 1650", arch: "Turing" },
    { name: "GeForce GTX 1630", arch: "Turing" },
    { name: "GeForce GTX 1080 Ti", arch: "Pascal" },
    { name: "GeForce GTX 1080", arch: "Pascal" },
    { name: "GeForce GTX 1070 Ti", arch: "Pascal" },
    { name: "GeForce GTX 1070", arch: "Pascal" },
    { name: "GeForce GTX 1060", arch: "Pascal" },
    { name: "GeForce GTX 1050", arch: "Pascal" },
    { name: "GeForce GTX 1030", arch: "Pascal" },
    { name: "GeForce GTX 980 Ti", arch: "Maxwell" },
    { name: "GeForce GTX 980", arch: "Maxwell" },
    { name: "GeForce GTX 970", arch: "Maxwell" },
    { name: "GeForce GTX 960", arch: "Maxwell" },
    { name: "GeForce GTX 950", arch: "Maxwell" },
    { name: "GeForce GTX 780 Ti", arch: "Kepler" },
    { name: "GeForce GTX 780", arch: "Kepler" },
    { name: "GeForce GTX 770", arch: "Kepler" },
    { name: "GeForce GTX 760", arch: "Kepler" },
    { name: "GeForce GTX 750 Ti", arch: "Maxwell" },
    { name: "GeForce GTX 730", arch: "Kepler" },
    { name: "GeForce GTX 720", arch: "Kepler" },
    { name: "GeForce GTX 710", arch: "Kepler" },
    { name: "GeForce GTX 690", arch: "Kepler" },
    { name: "GeForce GTX 680", arch: "Kepler" },
    { name: "GeForce GTX 670", arch: "Kepler" },
    { name: "GeForce GTX 660", arch: "Kepler" },
    // 笔记本 GPU
    { name: "GeForce RTX 4090 Laptop GPU", arch: "Ada Lovelace" },
    { name: "GeForce RTX 4080 Laptop GPU", arch: "Ada Lovelace" },
    { name: "GeForce RTX 4070 Laptop GPU", arch: "Ada Lovelace" },
    { name: "GeForce RTX 4060 Laptop GPU", arch: "Ada Lovelace" },
    { name: "GeForce RTX 4050 Laptop GPU", arch: "Ada Lovelace" },
    { name: "GeForce RTX 3080 Ti Laptop GPU", arch: "Ampere" },
    { name: "GeForce RTX 3080 Laptop GPU", arch: "Ampere" },
    { name: "GeForce RTX 3070 Ti Laptop GPU", arch: "Ampere" },
    { name: "GeForce RTX 3070 Laptop GPU", arch: "Ampere" },
    { name: "GeForce RTX 3060 Laptop GPU", arch: "Ampere" },
    { name: "GeForce RTX 3050 Ti Laptop GPU", arch: "Ampere" },
    { name: "GeForce RTX 3050 Laptop GPU", arch: "Ampere" },
    { name: "GeForce RTX 2080 SUPER", arch: "Turing" },
    { name: "GeForce MX570", arch: "Ampere" },
    { name: "GeForce MX550", arch: "Turing" },
    { name: "GeForce MX350", arch: "Pascal" },
    { name: "GeForce MX330", arch: "Pascal" },
    { name: "GeForce GTX 980M", arch: "Maxwell" },
    { name: "GeForce GTX 970M", arch: "Maxwell" },
    { name: "GeForce GTX 960M", arch: "Maxwell" },
    { name: "GeForce GTX 950M", arch: "Maxwell" },
    { name: "GeForce GTX 945M", arch: "Maxwell" },
    { name: "GeForce GTX 940MX", arch: "Maxwell" },
    { name: "GeForce GTX 930MX", arch: "Maxwell" },
    { name: "GeForce GTX 920MX", arch: "Maxwell" },
    { name: "GeForce GTX 880M", arch: "Kepler" },
    { name: "GeForce GTX 870M", arch: "Kepler" },
    { name: "GeForce GTX 860M", arch: "Kepler" },
    { name: "GeForce GTX 850M", arch: "Maxwell" }
  ],
  "AMD": [
    // 桌面 GPU
    { name: "Radeon RX 7900 XTX", arch: "RDNA 3" },
    { name: "Radeon RX 7900 XT", arch: "RDNA 3" },
    { name: "Radeon RX 7900 GRE", arch: "RDNA 3" },
    { name: "Radeon RX 7800 XT", arch: "RDNA 3" },
    { name: "Radeon RX 7700 XT", arch: "RDNA 3" },
    { name: "Radeon RX 7600", arch: "RDNA 3" },
    { name: "Radeon RX 6950 XT", arch: "RDNA 2" },
    { name: "Radeon RX 6900 XT", arch: "RDNA 2" },
    { name: "Radeon RX 6800 XT", arch: "RDNA 2" },
    { name: "Radeon RX 6800", arch: "RDNA 2" },
    { name: "Radeon RX 6750 XT", arch: "RDNA 2" },
    { name: "Radeon RX 6700 XT", arch: "RDNA 2" },
    { name: "Radeon RX 6700", arch: "RDNA 2" },
    { name: "Radeon RX 6650 XT", arch: "RDNA 2" },
    { name: "Radeon RX 6600 XT", arch: "RDNA 2" },
    { name: "Radeon RX 6600", arch: "RDNA 2" },
    { name: "Radeon RX 6500 XT", arch: "RDNA 2" },
    { name: "Radeon RX 6400", arch: "RDNA 2" },
    { name: "Radeon RX 5700 XT", arch: "RDNA 1" },
    { name: "Radeon RX 5700", arch: "RDNA 1" },
    { name: "Radeon RX 5600 XT", arch: "RDNA 1" },
    { name: "Radeon RX 5600", arch: "RDNA 1" },
    { name: "Radeon RX 5500 XT", arch: "RDNA 1" },
    { name: "Radeon RX 590", arch: "GCN 4th Gen (Polaris)" },
    { name: "Radeon RX 580", arch: "GCN 4th Gen (Polaris)" },
    { name: "Radeon RX 570", arch: "GCN 4th Gen (Polaris)" },
    { name: "Radeon RX 560 XT", arch: "GCN 4th Gen (Polaris)" },
    { name: "Radeon RX 560", arch: "GCN 4th Gen (Polaris)" },
    { name: "Radeon RX 550", arch: "GCN 4th Gen (Polaris)" },
    { name: "Radeon RX 480", arch: "GCN 4th Gen (Polaris)" },
    { name: "Radeon RX 470", arch: "GCN 4th Gen (Polaris)" },
    { name: "Radeon RX 460", arch: "GCN 4th Gen (Polaris)" },
    // 笔记本 GPU
    { name: "Radeon RX 7900M", arch: "RDNA 3" },
    { name: "Radeon RX 7600M XT", arch: "RDNA 3" },
    { name: "Radeon RX 7600M", arch: "RDNA 3" },
    { name: "Radeon RX 7700S", arch: "RDNA 3" },
    { name: "Radeon RX 7600S", arch: "RDNA 3" },
    { name: "Radeon RX 6850M XT", arch: "RDNA 2" },
    { name: "Radeon RX 6800M", arch: "RDNA 2" },
    { name: "Radeon RX 6700M", arch: "RDNA 2" },
    { name: "Radeon RX 6650M", arch: "RDNA 2" },
    { name: "Radeon RX 6600M", arch: "RDNA 2" },
    { name: "Radeon RX 6550M", arch: "RDNA 2" },
    { name: "Radeon RX 6500M", arch: "RDNA 2" },
    { name: "Radeon RX 6450M", arch: "RDNA 2" },
    { name: "Radeon RX 6300M", arch: "RDNA 2" },
    { name: "Radeon RX 6800S", arch: "RDNA 2" },
    { name: "Radeon RX 6700S", arch: "RDNA 2" },
    { name: "Radeon RX 6550S", arch: "RDNA 2" },
    { name: "Radeon RX 5300M", arch: "RDNA 1" },
    { name: "Radeon RX 540", arch: "GCN 4th Gen (Polaris)" },
    { name: "Radeon Vega 3", arch: "GCN 5th Gen (Vega)" },
    { name: "Radeon Vega 5", arch: "GCN 5th Gen (Vega)" },
    { name: "Radeon Vega 6", arch: "GCN 5th Gen (Vega)" },
    { name: "Radeon Vega 7", arch: "GCN 5th Gen (Vega)" },
    { name: "Radeon Vega 8", arch: "GCN 5th Gen (Vega)" },
    { name: "Radeon Vega 11", arch: "GCN 5th Gen (Vega)" },
    { name: "Radeon 660M", arch: "RDNA 2" },
    { name: "Radeon 680M", arch: "RDNA 2" },
    { name: "Radeon 610M", arch: "RDNA 2" },
    { name: "Radeon 740M", arch: "RDNA 3" },
    { name: "Radeon 760M", arch: "RDNA 3" },
    { name: "Radeon 780M", arch: "RDNA 3" }
  ],
  "Intel": [
    // 集成 GPU
    { name: "Intel HD Graphics 510", arch: "Skylake" },
    { name: "Intel HD Graphics 630", arch: "Kaby Lake" },
    { name: "Intel UHD Graphics 630", arch: "Coffee Lake" },
    { name: "Intel UHD Graphics 730", arch: "Rocket Lake" },
    { name: "Intel UHD Graphics 750", arch: "Rocket Lake" },
    { name: "Intel UHD Graphics 770", arch: "Alder Lake" },
    { name: "Intel Iris Xe Graphics 80", arch: "Tiger Lake" },
    { name: "Intel Iris Xe Graphics 48", arch: "Tiger Lake" },
    { name: "Intel Iris Xe Graphics 96", arch: "Tiger Lake" },
    // 独立 GPU
    { name: "Intel Arc A770", arch: "Xe-HPG (Alchemist)" },
    { name: "Intel Arc A750", arch: "Xe-HPG (Alchemist)" },
    { name: "Intel Arc A580", arch: "Xe-HPG (Alchemist)" },
    { name: "Intel Arc A380", arch: "Xe-HPG (Alchemist)" },
    { name: "Intel Arc A310", arch: "Xe-HPG (Alchemist)" },
    { name: "Intel Arc B580", arch: "Xe2-HPG (Battlemage)" },
    { name: "Intel Arc B570", arch: "Xe2-HPG (Battlemage)" }
  ]
};

//
const macInfo =
  [
    // MacBook Pro 系列（2017年起）
    {
      "mode": "MacBook Pro 13\" 2017 (无 Touch Bar)",
      "cpu": "i5-7360U",
      "cpu-arch": "Kaby Lake",
      "core": 8,
      "cputype": "Intel",
      "money": 8192, // 8GB
      "screen": "2560 * 1600",
      "gpu": "Intel Iris Plus Graphics 640",
      "gpu-arch": "Kaby Lake",
      "vendor": "Intel"
    },
    {
      "mode": "MacBook Pro 15\" 2017 (带 Touch Bar)",
      "cpu": "i7-7700HQ",
      "cpu-arch": "Kaby Lake",
      "core": 8,
      "cputype": "Intel",
      "money": 16384, // 16GB
      "screen": "2880 * 1800",
      "gpu": "Radeon Pro 560",
      "gpu-arch": "GCN 4th Gen (Polaris)",
      "vendor": "AMD"
    },
    {
      "mode": "MacBook Pro 13\" 2020 (M1)",
      "cpu": "Apple M1",
      "cpu-arch": "ARMv8-A",
      "core": 8, // 4性能核 + 4效率核
      "cputype": "Apple Silicon",
      "money": 8192, // 8GB 统一内存
      "screen": "2560 * 1600",
      "gpu": "Apple 8-core GPU",
      "gpu-arch": "Apple Custom",
      "vendor": "Apple"
    },
    {
      "mode": "MacBook Pro 14\" 2021 (M1 Pro)",
      "cpu": "Apple M1 Pro",
      "cpu-arch": "ARMv8-A",
      "core": 10, // 8性能核 + 2效率核
      "cputype": "Apple Silicon",
      "money": 16384, // 16GB 统一内存
      "screen": "3024 * 1964",
      "gpu": "Apple 16-core GPU",
      "gpu-arch": "Apple Custom",
      "vendor": "Apple"
    },
    {
      "mode": "MacBook Pro 16\" 2023 (M2 Max)",
      "cpu": "Apple M2 Max",
      "cpu-arch": "ARMv8.5-A",
      "core": 12, // 8性能核 + 4效率核
      "cputype": "Apple Silicon",
      "money": 32768, // 32GB 统一内存
      "screen": "3456 * 2234",
      "gpu": "Apple 38-core GPU",
      "gpu-arch": "Apple Custom",
      "vendor": "Apple"
    },
    {
      "mode": "MacBook Pro 14\" 2024 (M4 Pro)",
      "cpu": "Apple M4 Pro",
      "cpu-arch": "ARMv9-A",
      "core": 14, // 10性能核 + 4效率核
      "cputype": "Apple Silicon",
      "money": 24576, // 24GB 统一内存
      "screen": "3024 * 1964",
      "gpu": "Apple 20-core GPU",
      "gpu-arch": "Apple Custom",
      "vendor": "Apple"
    },

    // iMac Pro（2017-2021）
    {
      "mode": "iMac Pro 27\" 2017",
      "cpu": "Xeon W-2140B",
      "cpu-arch": "Skylake-SP",
      "core": 8,
      "cputype": "Intel",
      "money": 32768, // 32GB
      "screen": "5120 * 2880",
      "gpu": "Radeon Pro Vega 56",
      "gpu-arch": "GCN 5th Gen (Vega)",
      "vendor": "AMD"
    },

    // Mac mini（2017年起）
    {
      "mode": "Mac mini 2018",
      "cpu": "i5-8500B",
      "cpu-arch": "Coffee Lake",
      "core": 6,
      "cputype": "Intel",
      "money": 8192, // 8GB
      "screen": "NODE",
      "gpu": "Intel UHD Graphics 630",
      "gpu-arch": "Coffee Lake",
      "vendor": "Intel"
    },
    {
      "mode": "Mac mini 2020 (M1)",
      "cpu": "Apple M1",
      "cpu-arch": "ARMv8-A",
      "core": 8, // 4性能核 + 4效率核
      "cputype": "Apple Silicon",
      "money": 8192, // 8GB 统一内存
      "screen": "NODE",
      "gpu": "Apple 8-core GPU",
      "gpu-arch": "Apple Custom",
      "vendor": "Apple"
    },
    {
      "mode": "Mac mini 2023 (M2 Pro)",
      "cpu": "Apple M2 Pro",
      "cpu-arch": "ARMv8.5-A",
      "core": 12, // 8性能核 + 4效率核
      "cputype": "Apple Silicon",
      "money": 16384, // 16GB 统一内存
      "screen": "NODE",
      "gpu": "Apple 19-core GPU",
      "gpu-arch": "Apple Custom",
      "vendor": "Apple"
    },
    {
      "mode": "Mac mini 2024 (M4 Pro)",
      "cpu": "Apple M4 Pro",
      "cpu-arch": "ARMv9-A",
      "core": 14, // 10性能核 + 4效率核
      "cputype": "Apple Silicon",
      "money": 24576, // 24GB 统一内存
      "screen": "NODE",
      "gpu": "Apple 20-core GPU",
      "gpu-arch": "Apple Custom",
      "vendor": "Apple"
    }
  ];


// Chromium 官方稳定版本号（130 到 134）
//https://chromiumdash.appspot.com/releases?platform=Windows
const windowChromeVersions = [
  "135.0.7049.85",
  "135.0.7049.84",
  "135.0.7049.43",
  "135.0.7049.42",
  "135.0.7049.41",
  "134.0.6998.179",
  "134.0.6998.178",
  "134.0.6998.177",
  "134.0.6998.167",
  "134.0.6998.166",
  "134.0.6998.165",
  "134.0.6998.119",
  "134.0.6998.118",
  "134.0.6998.117",
  "134.0.6998.90",
  "134.0.6998.89",
  "134.0.6998.88",
  "134.0.6998.37",
  "134.0.6998.36",
  "134.0.6998.35",
  "133.0.6943.143",
  "133.0.6943.142",
  "133.0.6943.141",
  "133.0.6943.128",
  "133.0.6943.127",
  "133.0.6943.126",
  "133.0.6943.100",
  "133.0.6943.99",
  "133.0.6943.98",
  "132.0.6834.197",
  "133.0.6943.60",
  "133.0.6943.59",
  "132.0.6834.196",
  "133.0.6943.54",
  "133.0.6943.53",
  "132.0.6834.162",
  "133.0.6943.35",
  "132.0.6834.161",
  "132.0.6834.160",
  "132.0.6834.159",
  "132.0.6834.112",
  "132.0.6834.111",
  "132.0.6834.110",
  "131.0.6778.267",
  "132.0.6834.84",
  "132.0.6834.83"
];

const macChromeVersions = [
  "135.0.7049.85",
  "135.0.7049.84",
  "135.0.7049.43",
  "135.0.7049.42",
  "135.0.7049.41",
  "134.0.6998.167",
  "134.0.6998.166",
  "134.0.6998.165",
  "134.0.6998.119",
  "134.0.6998.118",
  "134.0.6998.117",
  "134.0.6998.89",
  "134.0.6998.88",
  "134.0.6998.46",
  "134.0.6998.45",
  "134.0.6998.44",
  "133.0.6943.143",
  "133.0.6943.142",
  "133.0.6943.141",
  "133.0.6943.128",
  "133.0.6943.127",
  "133.0.6943.126",
  "133.0.6943.100",
  "133.0.6943.99",
  "133.0.6943.98",
  "133.0.6943.55",
  "133.0.6943.54",
  "133.0.6943.53",
  "132.0.6884.162",
  "133.0.6943.35",
  "132.0.6884.161",
  "132.0.6884.160",
  "132.0.6884.159",
  "132.0.6884.112",
  "132.0.6884.111",
  "132.0.6884.110",
  "131.0.6778.267",
  "132.0.6884.84"
];

const linuxChromeVersions = [
  "135.0.7049.84",
  "135.0.7049.52",
  "134.0.6998.165",
  "134.0.6998.117",
  "134.0.6998.88",
  "134.0.6998.35",
  "133.0.6943.141",
  "133.0.6943.126",
  "133.0.6943.98",
  "132.0.6834.159",
  "132.0.6834.110",
  "132.0.6834.83",
];


// 辅助函数：随机值生成
function randomOsType() {
  const osTypes = ["window", "linux"];
  return osTypes[Math.floor(Math.random() * osTypes.length)];
}

//生成系统信息
function randomOsInfo(osType) {
  const data = {
    osVersion: "10.0", //版本
    NT: "10.0.19045", //内部版本
    code: "Vibranium", //代号
    platform: "Win32", //平台
    os: "Windows"
  };


  switch (osType) {
    case "window":
      //公示版本
      const winVersion = ["10.0", "11.0"][Math.floor(Math.random() * 2)];
      let d;
      //内部版本
      if (winVersion === "10.0") {
        d = ["10.0.19041/Vanadium", "10.0.19044/Iron", "10.0.19045/Vibranium"][Math.floor(Math.random() * 3)];
      } else {
        d = ["10.0.22621/Sun Valley 2", "10.0.22631/Sun Valley 3"][Math.floor(Math.random() * 2)];
      }
      const arr = d.split("/");
      data["NT"] = arr[0];
      data["code"] = arr[1];
      data["osVersion"] = winVersion;
      data["platform"] = "Win32";
      data["os"] = "Windows";
      break;
    case "macos":
      const macVer = [
        "14.0.0/Sonoma", "14.1.0/Sonoma", "14.2.0/Sonoma", "14.3.0/Sonoma", "14.4.0/Sonoma", "14.5.0/Sonoma",
        "13.0.1/Ventura", "13.0.1/Ventura", "13.1.0/Ventura", "13.2.0/Ventura", "13.3.1/Ventura", "13.4.0/Ventura", "13.5.2/Ventura",
        "12.0.1/Monterey", "12.1.2/Monterey", "12.2.0/Monterey", "12.3.1/Monterey", "12.4.0/Monterey", "12.5.1/Monterey", "12.6.0/Monterey",
        "11.0.3/Big Sur", "11.1.1/Big Sur", "11.2.0/Big Sur", "11.3.3/Big Sur", "11.4.1/Big Sur", "11.6.1/Big Sur"
      ];
      const macInfo = macVer[Math.floor(Math.random() * macVer.length)];
      const marr = macInfo.split("/");
      data["NT"] = marr[0];
      data["osVersion"] = marr[0];
      data["code"] = marr[1];
      data["platform"] = "MacIntel";
      data["os"] = "macOS";
      break;
    case "linux":
      const linfo = ["24.04 LTS/Noble Numbat", "22.04 LTS/Jammy Jellyfish", "20.04 LTS/Focal Fossa"][Math.floor(Math.random() * 3)];
      const larr = linfo.split("/");
      data["NT"] = larr[0];
      data["osVersion"] = larr[0];
      data["code"] = larr[1];
      data["platform"] = "Linux x86_64";
      data["os"] = "Linux";

  }
  return data;
}

/**
 * 生成浏览器品牌信息
 * @returns {string}
 */
function randomBrowserBrand() {
  const brands = ["Chrome", "Edge", "Opera", "Vivaldi"];
  return brands[Math.floor(Math.random() * brands.length)];
}

/**
 * 生成内存大小
 * @returns {string}
 */
function randomMemory() {
  const memory = ["4","8", "16","24","32"];
  return memory[Math.floor(Math.random() * memory.length)];
}

/**
 * 生成CPU逻辑处理器数量
 * @returns {string}
 */
function randomCPU() {
  const cpu = ["4", "6", "8", "10", "12", "16", "24", "32"];
  return cpu[Math.floor(Math.random() * cpu.length)];
}

/**
 * 生成浏览器版本
 * @returns {string}
 */
function randomBrowserVersion(osType = "window") {
  switch (osType) {
    case "macos":
      return macChromeVersions[Math.floor(Math.random() * macChromeVersions.length)];
    case "linux":
      return linuxChromeVersions[Math.floor(Math.random() * linuxChromeVersions.length)];
    default:
      return windowChromeVersions[Math.floor(Math.random() * windowChromeVersions.length)];
  }
}

/**
 * 验证浏览器版本
 * @param version
 * @param osType
 * @returns {*|string}
 */
function validateBrowserVersion(version, osType = "window") {

  switch (osType) {
    case "macos":
      return macChromeVersions.includes(version) ? version : randomBrowserVersion(osType);
    case "linux":
      return linuxChromeVersions.includes(version) ? version : randomBrowserVersion(osType);
    default:
      return windowChromeVersions.includes(version) ? version : randomBrowserVersion(osType);
  }
}

/**
 * 生成屏幕分辨率
 * @return
 */
function randomScreenResolution() {
  const resolutions = [
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 },
    { width: 3840, height: 2160 },
    { width: 3440, height: 1440 },
    { width: 2560, height: 1600 },
    { width: 5120, height: 2880 }
  ];
  return resolutions[Math.floor(Math.random() * resolutions.length)];
}

/**
 * 生成GPU厂家
 * @returns {string}
 */
function randomGpuVendor() {
  const gpuVendors = ["NVIDIA", "AMD", "Intel"];
  return gpuVendors[Math.floor(Math.random() * gpuVendors.length)];
}

/**
 * 根据GPU厂家生成显卡型号
 * @param vendor
 * @returns {*}
 */
function randomGpuModel(vendor) {
  const models = gpuModels[vendor] || gpuModels["NVIDIA"];
  return models[Math.floor(Math.random() * models.length)];
}
//生成苹果电脑信息
function randomMacInfo() {
  return macInfo[Math.floor(Math.random() * macInfo.length)];
}

//24GB 转换为MB数值 24*1024
function convertMemToMB(memStr) {
  // 使用正则匹配数值和单位（支持小数和空格）
  const match = memStr.match(/^\s*([\d.]+)\s*([A-Za-z]+)\s*$/);
  const value = parseFloat(match[1]); //单位
  const unit = match[2].toUpperCase();
  // 定义单位到MB的转换因子
  const unitFactors = {
    "B": 1 / (1024 ** 2),   // 1 B = 1/1048576 MB
    "KB": 1 / 1024,          // 1 KB = 0.0009765625 MB
    "MB": 1,                 // 1 MB = 1 MB
    "GB": 1024,              // 1 GB = 1024 MB
    "TB": 1024 ** 2         // 1 TB = 1048576 MB
  };
  return value * unitFactors[unit];
}

// 生成 WebGL 指纹
function generateWebGLReport(gpuVendor, gpuRenderer) {
  // Vendor 伪装为真实厂商
  let vendor;
  switch (gpuVendor) {
    case "NVIDIA":
      vendor = "Google Inc. (NVIDIA)";
      break;
    case "AMD":
      vendor = "Google Inc. (AMD)";
      break;
    case "Intel":
      vendor = "Google Inc. (Intel)";
      break;
    case "Apple":
      vendor = "Google Inc. (Apple)";
      break;
    default:
      vendor = "Google Inc. (Unknown)";
      gpuRenderer="Unknown";
  }
  // Renderer 格式：ANGLE (Vendor, Model, Driver)
  return `ANGLE (${gpuVendor}, ${gpuRenderer} (0x0000${Math.floor(Math.random() * 10000).toString(16).padStart(4, "0")}) Direct3D11 vs_5_0 ps_5_0, D3D11)`;
}


function generateUserAgent(osType, osVersion, chromeVersion, browserBrand = "") {
  let platform;
  switch (osType.toLowerCase()) {
    case "window":
      platform = `Windows NT ${osVersion}; Win64; x64`;
      break;
    case "macos":
      const macVersion = osVersion.replace(/\./g, "_");
      platform = `Macintosh; Intel Mac OS X ${macVersion}`;
      break;
    case "linux":
      platform = "Linux x86_64";
      break;
    default:
      throw new Error("Unsupported OS");
  }
  //使用大版本133.0.0.0
  const browserVersion = chromeVersion.split(".")[0] + ".0.0.0";
  let ua = `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion} Safari/537.36`;
  switch (browserBrand) {
    case "Edge":
      ua += ` Edg/${browserVersion}`;
      break;
    case "Vivaldi":
      ua += ` Vivaldi`;
      break;
    case "Opera":
      ua += ` OPR/${browserVersion}`;
      break;
    case "Chrome":
    default:
      break;
  }
  return ua;
}


// 生成浏览器指纹
function generateFingerprint(osType, brand) {
  osType = "window";
  //生成系统信息
  const osInfo = randomOsInfo(osType);
  let browserBrand;
  if (brand !== "" && brand !== "Chrome") {
    browserBrand = randomBrowserBrand();
  } else {
    browserBrand = "Chrome";
  }

  const chromeVersion = randomBrowserVersion(osType);
  let gpuVendor = randomGpuVendor();
  let gpuInfo = randomGpuModel(gpuVendor);
  let gpuRenderer = gpuInfo["name"];
  let gpuArch = gpuInfo["arch"].toLowerCase();
  //单位GB
  let memory = randomMemory();

  let screen = randomScreenResolution();
  let cpuCore = randomCPU();
  if (osType === "macos") {
    let macOsINFO = randomMacInfo();
    memory = macOsINFO["money"] / 1024;
    gpuVendor = macOsINFO["vendor"];
    gpuRenderer = macOsINFO["gpu"];
    gpuArch = macOsINFO["gpu-arch"].toLowerCase();
    cpuCore = macOsINFO["core"];

    //屏幕大小
    if (macOsINFO["screen"] !== "NODE") {
      const match = macOsINFO["screen"].match(/^\s*(\d+)\s*([*xX])\s*(\d+)\s*$/);
      screen.width = parseInt(match[1], 10);
      screen.height = parseInt(match[3], 10);
    }
  }
  //Mozilla/[版本] ([系统及平台信息]) [引擎标识] ([引擎详情]) [浏览器标识] [其他扩展信息]
  let ua = generateUserAgent(osType, osInfo.osVersion, chromeVersion, browserBrand);

  return {
    userAgent: ua,
    cpuCore: cpuCore,
    memory: memory,
    gpuVendor: gpuVendor,
    gpuRenderer: gpuRenderer,
    gpuArch: gpuArch,
    browserBrand: browserBrand,
    chromeVersion: chromeVersion,
    screen: screen,
    webGLReport: generateWebGLReport(gpuVendor, gpuRenderer),
    os: osType,
    osVersion: osInfo.osVersion,
    osInfo: osInfo
  };
}

export default generateFingerprint;
// 测试示例


