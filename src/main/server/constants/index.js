export const PIN_URL = [
  {
    name: "Google",
    n: "谷歌",
    url: "https://www.google.com/",
    file: "https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
  },
  {
    name: "X",
    n: "推特",
    url: "https://x.com/",
    file: "https://abs.twimg.com/favicons/twitter.3.ico"
  },
  {
    name: "Discord",
    n: "DC",
    url: "https://discord.com/",
    file: "https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/62fddf0fde45a8baedcc7ee5_847541504914fd33810e70a0ea73177e%20(2)-1.png"
  }, {
    name: "Telegram",
    n: "电报",
    url: "https://telegram.org/",
    file: "https://telegram.org/img/website_icon.svg?4"
  }
];
export const countryToLangMap = {
  // ================ 亚洲 ================
  CN: {code:"zh-CN", name:"中国"},
  TW: {code:"zh-TW", name:"中国台湾"},
  HK: {code:"zh-HK", name:"中国香港"},
  MO: {code:"zh-MO", name:"中国澳门"},
  JP: {code:"ja-JP", name:"日本"},
  KR: {code:"ko-KR", name:"韩国"},
  SG: {code:"en-SG", name:"新加坡"},
  IN: {code:"en-IN", name:"印度"},
  TH: {code:"th-TH", name:"泰国"},
  VN: {code:"vi-VN", name:"越南"},
  MY: {code:"ms-MY", name:"马来西亚"},
  ID: {code:"id-ID", name:"印度尼西亚"},
  SA: {code:"ar-SA", name:"沙特阿拉伯"},
  AE: {code:"ar-AE", name:"阿联酋"},
  TR: {code:"tr-TR", name:"土耳其"},
  PH: {code:"fil-PH", name:"菲律宾"},
  PK: {code:"ur-PK", name:"巴基斯坦"},
  IL: {code:"he-IL", name:"以色列"},
  IQ: {code:"ar-IQ", name:"伊拉克"},
  BN: {code:"ms-BN", name:"汶莱"},

  // ================ 欧洲 ================
  DE: {code:"de-DE", name:"德国"},
  FR: {code:"fr-FR", name:"法国"},
  GB: {code:"en-GB", name:"英国"},
  IT: {code:"it-IT", name:"意大利"},
  ES: {code:"es-ES", name:"西班牙"},
  RU: {code:"ru-RU", name:"俄罗斯"},
  NL: {code:"nl-NL", name:"荷兰"},
  SE: {code:"sv-SE", name:"瑞典"},
  NO: {code:"nb-NO", name:"挪威"},
  DK: {code:"da-DK", name:"丹麦"},
  FI: {code:"fi-FI", name:"芬兰"},
  PL: {code:"pl-PL", name:"波兰"},
  GR: {code:"el-GR", name:"希腊"},
  PT: {code:"pt-PT", name:"葡萄牙"},
  CH: {code:"de-CH", name:"瑞士"},
  BE: {code:"nl-BE", name:"比利时"},
  AT: {code:"de-AT", name:"奥地利"},
  IE: {code:"en-IE", name:"爱尔兰"},
  LT: {code:"lt-LT", name:"立陶宛"},
  BO: {code:"es-BO", name:"玻利维亚"},


  // ================ 美洲 ================
  US: {code:"en-US", name:"美国"},
  CA: {code:"en-CA", name:"加拿大"},
  MX: {code:"es-MX", name:"墨西哥"},
  BR: {code:"pt-BR", name:"巴西"},
  AR: {code:"es-AR", name:"阿根廷"},
  CL: {code:"es-CL", name:"智利"},
  CO: {code:"es-CO", name:"哥伦比亚"},
  PE: {code:"es-PE", name:"秘鲁"},
  VE: {code:"es-VE", name:"委内瑞拉"},
  CS: {code:"cs-CZ", name:"捷克"},

  // ================ 非洲 ================
  ZA: {code:"en-ZA", name:"南非"},
  EG: {code:"ar-EG", name:"埃及"},
  NG: {code:"en-NG", name:"尼日利亚"},
  KE: {code:"sw-KE", name:"肯尼亚"},
  MA: {code:"ar-MA", name:"摩洛哥"},
  DZ: {code:"ar-DZ", name:"阿尔及利亚"},

  // ================ 大洋洲 ================
  AU: {code:"en-AU", name:"澳大利亚"},
  NZ: {code:"en-NZ", name:"新西兰"},
  FJ: {code:"en-FJ", name:"斐济"},
  PG: {code:"en-PG", name:"巴布亚新几内亚"}
};


export const linuxToWindowsMap = {
  1: 0x1B,    // Escape -> VK_ESCAPE
  2: 0x31,    // 1 -> VK_1
  3: 0x32,    // 2 -> VK_2
  4: 0x33,    // 3 -> VK_3
  5: 0x34,    // 4 -> VK_4
  6: 0x35,    // 5 -> VK_5
  7: 0x36,    // 6 -> VK_6
  8: 0x37,    // 7 -> VK_7
  9: 0x38,    // 8 -> VK_8
  10: 0x39,   // 9 -> VK_9
  11: 0x30,   // 0 -> VK_0
  12: 0xBD,   // Minus -> VK_OEM_MINUS
  13: 0xBB,   // Equal -> VK_OEM_PLUS
  14: 0x08,   // Backspace -> VK_BACK
  15: 0x09,   // Tab -> VK_TAB
  16: 0x51,   // Q -> VK_Q
  17: 0x57,   // W -> VK_W
  18: 0x45,   // E -> VK_E
  19: 0x52,   // R -> VK_R
  20: 0x54,   // T -> VK_T
  21: 0x59,   // Y -> VK_Y
  22: 0x55,   // U -> VK_U
  23: 0x49,   // I -> VK_I
  24: 0x4F,   // O -> VK_O
  25: 0x50,   // P -> VK_P
  26: 0xDB,   // BracketLeft -> VK_OEM_4
  27: 0xDD,   // BracketRight -> VK_OEM_6
  28: 0x0D,   // Enter -> VK_RETURN
  29: 0x11,   // Ctrl -> VK_CONTROL
  30: 0x41,   // A -> VK_A
  31: 0x53,   // S -> VK_S
  32: 0x44,   // D -> VK_D
  33: 0x46,   // F -> VK_F
  34: 0x47,   // G -> VK_G
  35: 0x48,   // H -> VK_H
  36: 0x4A,   // J -> VK_J
  37: 0x4B,   // K -> VK_K
  38: 0x4C,   // L -> VK_L
  39: 0xBA,   // Semicolon -> VK_OEM_1
  40: 0xDE,   // Quote -> VK_OEM_7
  41: 0xC0,   // Backquote -> VK_OEM_3
  42: 0x10,   // Shift -> VK_SHIFT
  43: 0xDC,   // Backslash -> VK_OEM_5
  44: 0x5A,   // Z -> VK_Z
  45: 0x58,   // X -> VK_X
  46: 0x43,   // C -> VK_C
  47: 0x56,   // V -> VK_V
  48: 0x42,   // B -> VK_B
  49: 0x4E,   // N -> VK_N
  50: 0x4D,   // M -> VK_M
  51: 0xBC,   // Comma -> VK_OEM_COMMA
  52: 0xBE,   // Period -> VK_OEM_PERIOD
  53: 0xBF,   // Slash -> VK_OEM_2
  54: 0x10,   // ShiftRight -> VK_SHIFT
  55: 0x6A,   // NumpadMultiply -> VK_MULTIPLY
  56: 0x12,   // Alt -> VK_MENU
  57: 0x20,   // Space -> VK_SPACE
  58: 0x14,   // CapsLock -> VK_CAPITAL
  59: 0x70,   // F1 -> VK_F1
  60: 0x71,   // F2 -> VK_F2
  61: 0x72,   // F3 -> VK_F3
  62: 0x73,   // F4 -> VK_F4
  63: 0x74,   // F5 -> VK_F5
  64: 0x75,   // F6 -> VK_F6
  65: 0x76,   // F7 -> VK_F7
  66: 0x77,   // F8 -> VK_F8
  67: 0x78,   // F9 -> VK_F9
  68: 0x79,   // F10 -> VK_F10
  69: 0x90,   // NumLock -> VK_NUMLOCK
  70: 0x91,   // ScrollLock -> VK_SCROLL
  71: 0x67,   // Numpad7 -> VK_NUMPAD7
  72: 0x68,   // Numpad8 -> VK_NUMPAD8
  73: 0x69,   // Numpad9 -> VK_NUMPAD9
  74: 0x6D,   // NumpadSubtract -> VK_SUBTRACT
  75: 0x64,   // Numpad4 -> VK_NUMPAD4
  76: 0x65,   // Numpad5 -> VK_NUMPAD5
  77: 0x66,   // Numpad6 -> VK_NUMPAD6
  78: 0x6B,   // NumpadAdd -> VK_ADD
  79: 0x61,   // Numpad1 -> VK_NUMPAD1
  80: 0x62,   // Numpad2 -> VK_NUMPAD2
  81: 0x63,   // Numpad3 -> VK_NUMPAD3
  82: 0x60,   // Numpad0 -> VK_NUMPAD0
  83: 0x6E,   // NumpadDecimal -> VK_DECIMAL
  87: 0x7A,   // F11 -> VK_F11
  88: 0x7B,   // F12 -> VK_F12
  91: 0x7C,   // F13 -> VK_F13
  92: 0x7D,   // F14 -> VK_F14
  93: 0x7E,   // F15 -> VK_F15
  99: 0x7F,   // F16 -> VK_F16
  100: 0x80,  // F17 -> VK_F17
  101: 0x81,  // F18 -> VK_F18
  102: 0x82,  // F19 -> VK_F19
  103: 0x83,  // F20 -> VK_F20
  104: 0x84,  // F21 -> VK_F21
  105: 0x85,  // F22 -> VK_F22
  106: 0x86,  // F23 -> VK_F23
  107: 0x87,  // F24 -> VK_F24
  3613: 0x11, // CtrlRight -> VK_CONTROL
  3640: 0x12, // AltRight -> VK_MENU
  3637: 0x6F, // NumpadDivide -> VK_DIVIDE
  3639: 0x2C, // PrintScreen -> VK_SNAPSHOT
  3655: 0x24, // Home -> VK_HOME
  3657: 0x21, // PageUp -> VK_PRIOR
  3663: 0x23, // End -> VK_END
  3665: 0x22, // PageDown -> VK_NEXT
  3666: 0x2D, // Insert -> VK_INSERT
  3667: 0x2E, // Delete -> VK_DELETE
  3675: 0x5B, // Meta -> VK_LWIN
  3676: 0x5C  // MetaRight -> VK_RWIN
}
