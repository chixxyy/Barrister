# LegalEase Taiwan - 房屋租賃法律助手

這是一個專為台灣房東與房客設計的現代化法律文件生成工具。透過直覺的引導流程，協助用戶快速建立符合台灣法律規範的「存證信函」與「住宅租賃契約」。

## ✨ 主要功能

- **雙重身份支援**：針對「房東」與「房客」提供不同的引導入口。
- **文件生成**：
  - **存證信函**：針對租金欠繳、提前解約、押金返還、修繕責任等常見糾紛，自動生成專業法律用語。
  - **房屋租賃契約**：標準化住宅租賃契約書，包含常用的法律條款。
- **智慧格式化**：
  - 自動將日期轉換為中華民國紀年（如：113/01/01）。
  - 自動計算租金與押金總額（未來擴充）。
- **即時預覽**：所見即所得（WYSIWYG）的即時預覽功能，支援行動版縮放檢視。
- **現代化介面**：基於 Tailwind CSS 打造的精美 UI，提供極佳的使用者體驗。

## 🛠️ 技術架構

本專案使用以下技術構建：

- **核心框架**：[Vue 3](https://vuejs.org/) (Composition API)
- **開發工具**：[Vite](https://vitejs.dev/) + TypeScript
- **樣式庫**：[Tailwind CSS](https://tailwindcss.com/)
- **狀態管理**：[Pinia](https://pinia.vuejs.org/)
- **圖示庫**：Lucide Vue Next

## 🚀 快速開始

請確保您的電腦已安裝 [Node.js](https://nodejs.org/) (建議 v16+)。

### 1. 下載專案

```bash
git clone <repository-url>
cd Barrister
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

啟動後，瀏覽器通常會自動開啟 `http://localhost:5173`。

### 4. 建置生產版本

若要部署到正式環境，請執行：

```bash
npm run build
```

建置後的檔案將位於 `dist/` 目錄中。

## 🤝 貢獻

歡迎提交 Pull Request 或 Issue 來協助改進這個專案！

## 📄 授權

MIT License
