# 部署指南

本项目是纯静态网页，支持多种零成本部署方式。选择适合你的方式即可。

---

## 方式一：GitHub Pages（推荐 ⭐）

完全免费，有 GitHub 账号就能用。

### 步骤

1. **创建 GitHub 仓库**
   - 登录 GitHub，点击右上角 "+" → "New repository"
   - 仓库名建议：`invest-school`
   - 选择 "Public"（公开仓库才能免费使用 Pages）
   - 点击 "Create repository"

2. **上传项目文件**
   
   方式 A：网页直接上传（最简单）
   - 在仓库页面点击 "uploading an existing file"
   - 把本地所有文件拖进去
   - 点击 "Commit changes"

   方式 B：Git 命令行
   ```bash
   git init
   git add .
   git commit -m "初始提交"
   git branch -M main
   git remote add origin https://github.com/你的用户名/invest-school.git
   git push -u origin main
   ```

3. **开启 GitHub Pages**
   - 进入仓库的 "Settings" → "Pages"
   - Source 选择 "Deploy from a branch"
   - Branch 选择 `main` 分支，目录选择 `/ (root)`
   - 点击 "Save"
   - 等 1-2 分钟，页面会显示你的网站地址：`https://你的用户名.github.io/invest-school/`

4. **访问你的网站**
   - 打开上面的地址，就可以使用了！

---

## 方式二：Vercel（速度快，免费）

Vercel 是一个非常流行的静态网站托管平台，速度快，支持自动部署。

### 步骤

1. 访问 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 "Add New..." → "Project"
3. 选择你刚创建的 GitHub 仓库
4. 点击 "Deploy"，等待几十秒
5. 部署完成后，会得到一个 `xxx.vercel.app` 的域名
6. （可选）绑定自己的域名

---

## 方式三：Netlify（简单易用）

Netlify 也是非常受欢迎的静态网站托管平台。

### 步骤

1. 访问 [netlify.com](https://www.netlify.com)，用 GitHub 账号登录
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub，授权后选择你的仓库
4. 保持默认设置，点击 "Deploy site"
5. 部署完成后，会得到一个 `xxx.netlify.app` 的域名

---

## 方式四：Cloudflare Pages（全球加速）

Cloudflare Pages 提供全球 CDN 加速，访问速度很快。

### 步骤

1. 访问 [pages.cloudflare.com](https://pages.cloudflare.com)，注册/登录 Cloudflare
2. 点击 "Create a project" → "Connect to Git"
3. 选择 GitHub，授权后选择你的仓库
4. 构建命令留空，输出目录填 `/`
5. 点击 "Save and Deploy"
6. 部署完成后，会得到一个 `xxx.pages.dev` 的域名

---

## 方式五：本地部署（自己电脑上运行）

如果你只是想在自己电脑上使用，最简单。

### Windows

1. 下载所有文件到一个文件夹
2. 双击 `index.html` 直接用浏览器打开
3. 或者用 Python 启动本地服务器：
   ```bash
   # 安装 Python 后，在项目文件夹打开命令行
   python -m http.server 8000
   ```
   然后浏览器访问 `http://localhost:8000`

### Mac / Linux

```bash
# 进入项目目录
cd /path/to/invest-school

# 使用 Python
python3 -m http.server 8000

# 或使用 Node.js
npx serve .
```

然后浏览器访问 `http://localhost:8000`

---

## 方式六：自己的服务器

如果你有自己的服务器，可以这样部署：

### 使用 Nginx

1. 把所有文件上传到服务器，比如 `/var/www/invest-school/`
2. 配置 Nginx：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/invest-school;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```
3. 重启 Nginx：`systemctl restart nginx`
4. （推荐）配置 HTTPS：使用 Let's Encrypt 免费证书

### 使用 Apache

类似地，把文件放到网站根目录即可。

---

## 绑定自定义域名（可选）

如果你有自己的域名，可以绑定到以上任何平台。

### GitHub Pages 绑定域名
1. 在仓库 Settings → Pages → Custom domain 填入你的域名
2. 在域名 DNS 解析处添加 CNAME 记录指向 `你的用户名.github.io`

### Vercel / Netlify / Cloudflare
后台都有清晰的 "Add domain" 选项，按提示操作即可。

---

## 更新网站

以后需要更新内容时：

1. 修改本地文件
2. 提交到 GitHub
3. 如果用的是 GitHub Pages，等 1-2 分钟自动更新
4. 如果用的是 Vercel/Netlify/Cloudflare，推送代码后会自动部署

---

## 常见问题

**Q: 部署后访问不到？**
A: 等几分钟再试，首次部署需要一点时间。检查文件路径是否正确，仓库是否设为公开。

**Q: 样式不显示？**
A: 检查 `assets` 文件夹是否完整上传，路径是否正确。

**Q: GitHub Pages 域名后面有子路径，会不会有问题？**
A: 本项目使用相对路径，完全支持子路径部署，不需要修改任何配置。

**Q: 可以商用吗？**
A: 本项目是 MIT 许可证，可以自由使用，包括商用。但请注意内容仅供学习参考，不构成投资建议。
