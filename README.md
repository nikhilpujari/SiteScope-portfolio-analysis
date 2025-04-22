# 🚀 SiteScope 🎮 

SiteScope is a lightweight, privacy-friendly website analytics dashboard you can fully control and host yourself — no third-party services, no hidden costs.

## 📊 Features

SiteScope helps you track:
- Total visitors (footfall)
- Pages visited
- Visitor source (referrer)
- Visitor location (approximate)
- And more — all through a clean visual dashboard

## 🤔 Why SiteScope?

Whether you're applying for jobs, sharing your work, or growing your personal brand, it's important to know: **Is anyone actually seeing your content?** SiteScope gives you that insight — simply, quickly, and privately.

## 🛠️ How to Use It

### Step 1: Clone the Repo
Clone the repository to your GitHub profile.

### Step 2: Deploy the Dashboard
Use [Render.com](https://render.com/) or any Platform as a Service (PaaS) or cloud-based hosting provider. Create an account if you don't have one yet, and deploy the cloned website by connecting via GitHub or simply dragging and dropping the entire repository.

### Step 3: Add Tracking to Your Website
Add these two lines inside the HTML file of your portfolio website's `index.html` file:

```html
<script>
  window.__ANALYTICS_ENDPOINT__ = "https://YOUR_HOST_URL/track";
</script>
<script defer src="https://YOUR_HOST_URL/track.js"></script>
```

Replace `YOUR_HOST_URL` with the URL created when your SiteScope dashboard is deployed.

### Step 4: Deploy Updates
Push these changes to your GitHub repository where your portfolio is hosted and redeploy, or upload the updated changes directly to your server.

Now you can view your dashboard at:
`https://YOUR_HOST_URL`

## ⚠️ Disclaimer
If you're not planning to modify the dashboard code, avoid triggering redeployment as this may erase previous data since we're using lightweight SQLite. 

If you plan to build new features, consider using your hosting site's persistent database (the same one you might be using with your portfolio) to ensure your data is never overwritten.

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests to help improve SiteScope.

## 📜 License
[MIT License](LICENSE)