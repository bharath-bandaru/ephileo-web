# Quick Deployment Checklist for ephileo.us

## ✅ Pre-Deployment (Already Done)
- [x] Contact form API created
- [x] Environment variables configured locally
- [x] Resend API key obtained
- [x] All code is working locally on http://localhost:3001

## 🚀 Deployment Steps

### Step 1: Push to GitHub (5 minutes)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Ephileo portfolio website"

# Create a new repository on GitHub:
# Go to https://github.com/new
# Name: ephileo-web
# Visibility: Public or Private (your choice)
# DO NOT initialize with README (we already have code)

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ephileo-web.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel (5 minutes)

1. **Sign up for Vercel**
   - Go to https://vercel.com/signup
   - Click "Continue with GitHub"
   - Authorize Vercel to access your GitHub

2. **Import Project**
   - Click "Add New..." button (top right)
   - Select "Project"
   - Find and select `ephileo-web` repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected) ✓
   - Root Directory: ./ (default) ✓
   - Build Command: `npm run build` (default) ✓
   - Output Directory: `.next` (default) ✓
   - Install Command: `npm install` (default) ✓
   - **Click "Deploy"**

4. **Wait for Build**
   - First build takes 2-3 minutes
   - You'll get a temporary URL like: `ephileo-web-abc123.vercel.app`
   - **Test this URL first!**

### Step 3: Add Environment Variable (2 minutes)

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar

2. **Add Resend API Key**
   - Key: `RESEND_API_KEY`
   - Value: `re_hmtT8iEK_74H6kByAw61zTG48vB4VnvVC`
   - Environment: Check all three boxes (Production, Preview, Development)
   - Click "Save"

3. **Redeploy with Environment Variable**
   - Go to "Deployments" tab
   - Click the "..." menu on the latest deployment
   - Click "Redeploy"
   - Wait 1-2 minutes

### Step 4: Set Up Resend Domain (10 minutes)

1. **Login to Resend**
   - Go to https://resend.com
   - Login with your account

2. **Add Domain**
   - Click "Domains" in left sidebar
   - Click "Add Domain" button
   - Enter: `ephileo.us`
   - Click "Add"

3. **Configure DNS in GoDaddy**
   - Resend will show you DNS records to add
   - Go to GoDaddy → Domains → ephileo.us → DNS
   - Add these TXT records (Resend will provide exact values):

     **SPF Record:**
     - Type: TXT
     - Name: @
     - Value: (copy from Resend)
     - TTL: 600

     **DKIM Record:**
     - Type: TXT
     - Name: (copy from Resend, something like `resend._domainkey`)
     - Value: (copy from Resend)
     - TTL: 600

4. **Wait for Verification**
   - Can take 5 minutes to 24 hours
   - Check status in Resend dashboard
   - Once verified, contact form will work!

### Step 5: Connect Your Domain to Vercel (10 minutes)

**Option A: Vercel Nameservers (Recommended - Easier)**

1. **In Vercel Dashboard**
   - Go to Settings → Domains
   - Enter `ephileo.us` in the input field
   - Click "Add"
   - Vercel will detect it's not configured and show nameservers:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`

2. **In GoDaddy**
   - Go to GoDaddy account
   - My Products → Domains
   - Click on `ephileo.us`
   - Scroll to "Additional Settings"
   - Click "Manage DNS"
   - At the top, click on "Nameservers"
   - Click "Change Nameservers"
   - Select "Enter my own nameservers (advanced)"
   - Enter:
     - Nameserver 1: `ns1.vercel-dns.com`
     - Nameserver 2: `ns2.vercel-dns.com`
   - Click "Save"

3. **Add www subdomain in Vercel**
   - In Vercel → Settings → Domains
   - Add `www.ephileo.us`
   - Vercel will auto-configure redirect from www to root domain

**Important:** If you use Vercel nameservers, you'll need to re-add the Resend DNS records in Vercel's DNS settings instead of GoDaddy.

---

**Option B: Keep GoDaddy DNS (More Control)**

1. **In Vercel Dashboard**
   - Settings → Domains
   - Add `ephileo.us`
   - Vercel will show you what DNS records to add

2. **In GoDaddy DNS**
   - Add A Record:
     - Type: A
     - Name: @
     - Value: `76.76.21.21` (Vercel's IP)
     - TTL: 600 (10 minutes)

   - Add CNAME for www:
     - Type: CNAME
     - Name: www
     - Value: `cname.vercel-dns.com`
     - TTL: 600

3. **Wait for Propagation**
   - Usually 1-2 hours
   - Check status: https://dnschecker.org

### Step 6: Test Everything (5 minutes)

Wait 30-60 minutes for DNS to propagate, then test:

- [ ] Visit https://ephileo.us - Homepage loads with 3D scene
- [ ] Click each of the 3 buildings - Project pages open correctly
- [ ] Click "Projects" in nav - Scrolls to projects section
- [ ] Click "About" in nav - Scrolls to about section
- [ ] Click "Contact" in nav - Scrolls to contact form
- [ ] Fill out contact form - Email arrives at admin@ephileo.us
- [ ] Test on mobile device - Everything responsive
- [ ] Check https://www.ephileo.us - Redirects to ephileo.us

## 🎉 You're Live!

Your website is now live at https://ephileo.us

## 📝 Future Updates

Every time you want to update your site:

```bash
# Make your changes
git add .
git commit -m "Update: description of changes"
git push

# Vercel automatically deploys in ~2 minutes!
```

## 🔧 Troubleshooting

### Contact form not working
- Check Resend domain is verified
- Verify RESEND_API_KEY is set in Vercel
- Check Vercel function logs for errors

### Domain not loading
- Wait 24-48 hours for full DNS propagation
- Check nameservers: `nslookup ephileo.us`
- Verify SSL certificate in Vercel (auto-generated)

### Build errors
- Check Vercel deployment logs
- Ensure all dependencies in package.json
- Test build locally: `npm run build`

## 📊 Performance

Your site is optimized with:
- ✅ Next.js 16 (latest version)
- ✅ Edge functions for contact form
- ✅ Automatic image optimization
- ✅ Static generation where possible
- ✅ Code splitting
- ✅ SSL/HTTPS enabled
- ✅ CDN distribution worldwide

## 💰 Costs

- Vercel: **FREE** (100GB bandwidth/month included)
- Resend: **FREE** (3,000 emails/month included)
- Domain: ~$15/year (already owned)

**Total: $0/month** 🎉

## 📞 Support

- Full guide: See DEPLOYMENT.md
- Vercel Support: https://vercel.com/help
- Resend Docs: https://resend.com/docs
- Next.js Docs: https://nextjs.org/docs
