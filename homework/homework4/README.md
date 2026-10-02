母專案連結 - https://github.com/se-111410514/git/commits/main/

* 分支 - https://github.com/se-111410514/git/commits/developGitBranch/

子專案連結 - https://github.com/Eason-Xie302/git/commits/main/

# Git 與 GitHub 協作流程紀錄

## 在 GitHub 上建立新的 organization，名字為 se-111410514

### 1. Initial commit 專案的初始存檔
在 GitHub 上點擊「Create new repository」建立新專案 se-111410514，專案名稱為 git。
勾選建立 README.md，產生第一筆 Initial commit。

### 2. 分支與合併 (Branch & Merge)
使用 `git checkout -b developGitBranch` 建立並切換新分支進行修改與提交，隨後切回主分支 `git checkout main`，透過 `git merge developGitBranch` 與 `git push` 完成本地合併並同步至遠端。

### 3. Fork 與 Pull Request (Fork & PR)
在 GitHub 點擊 Fork 將母專案複製至個人帳號修改，完成提交後向母專案發起合併請求，經審核無衝突後完成跨倉庫合併。
