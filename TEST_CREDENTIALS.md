# 測試帳號文件 (Test Credentials)

為了方便開發與測試，系統目前設定開啟時會自動登入 Admin 帳號。

## 管理員帳號 (Admin)

擁有完整權限，可進入 Dashboard 管理商品、查看所有訂單與訊息。

- **Email**: `admin@komorebi.com`
- **Password**: (任意輸入)
- **權限**: ADMIN
- **功能**:
  - 商品管理 (CRUD)
  - 訂單狀態更新
  - 訊息回覆

## 一般測試帳號 (User)

一般會員權限，僅能查看自己的訂單與個人資料。

- **Email**: 任意非 admin email (例: `user@example.com`)
- **Password**: (任意輸入)
- **權限**: USER
- **功能**:
  - 瀏覽商品
  - 加入購物車
  - 結帳 (支援匯款與超商取貨)
  - 訂單付款備註 (匯款資訊)

> **注意**: 在 `AuthModal` 中，只要輸入 `admin@komorebi.com` 即會被視為管理員，其餘 Email 皆為一般使用者。
