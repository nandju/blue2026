// Analyse simple et lisible du User-Agent ("Chrome · Windows", "Safari · iPhone").

const BROWSERS = [
  [/Edg(?:e|A|iOS)?\/[\d.]+/, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser\//, "Samsung Internet"],
  [/Firefox\/|FxiOS\//, "Firefox"],
  [/CriOS\/|Chrome\//, "Chrome"],
  [/Version\/[\d.]+.*Safari\//, "Safari"],
];

const SYSTEMS = [
  [/iPhone/, "iPhone"],
  [/iPad/, "iPad"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

export function parseUserAgent(ua = "") {
  const browser = BROWSERS.find(([re]) => re.test(ua))?.[1] || "Navigateur inconnu";
  const os = SYSTEMS.find(([re]) => re.test(ua))?.[1] || "Système inconnu";
  const device = /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))
    ? "Tablette"
    : /Mobi|iPhone|Android/.test(ua)
      ? "Mobile"
      : "Ordinateur";
  return { browser, os, device, label: `${browser} · ${os}` };
}
