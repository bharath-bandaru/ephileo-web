# Ephileo Website Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier works great)
- GoDaddy domain access
- Resend API key (for contact form)

## Step 1: Push Code to GitHub

1. **Create a new repository on GitHub**
   - Go to https://github.com/new
   - Name it `ephileo-web` (or any name you prefer)
   - Make it public or private
   - Don't initialize with README (we already have code)

2. **Push your code to GitHub**
   ```bash
   # If you haven't initialized git yet
   git init
   git add .
   git commit -m "Initial commit - Ephileo portfolio website"

   # Add your GitHub repository as remote
   git remote add origin https://github.com/YOUR_USERNAME/ephileo-web.git

   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Sign up for Vercel**
   - Go to https://vercel.com/signup
   - Sign up with your GitHub account (easiest option)

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your `ephileo-web` repository
   - Click "Import"

3. **Configure Build Settings**
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
   - **Click "Deploy"**

4. **Wait for Deployment**
   - First deployment takes 2-3 minutes
   - You'll get a URL like `ephileo-web-xyz.vercel.app`
   - Test this URL to make sure everything works

## Step 3: Add Environment Variables

1. **In Vercel Dashboard**
   - Go to your project settings
   - Click "Environment Variables"

2. **Add the following variable:**
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key (from https://resend.com/api-keys)
   - Environment: Production, Preview, Development (select all)
   - Click "Save"

3. **Redeploy** (if already deployed)
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Select "Redeploy"

## Step 4: Set Up Resend (Email Service)

1. **Sign up for Resend**
   - Go to https://resend.com
   - Create an account

2. **Verify Your Domain**
   - In Resend dashboard, go to "Domains"
   - Click "Add Domain"
   - Enter `ephileo.us`
   - Add the provided DNS records to GoDaddy:
     - SPF record (TXT)
     - DKIM record (TXT)
   - Wait for verification (can take up to 24 hours)

3. **Get API Key**
   - Go to "API Keys" in Resend
   - Create a new API key
   - Copy it and add to Vercel (see Step 3)

## Step 5: Connect Your GoDaddy Domain

### Option A: Use Vercel DNS (Recommended - Easiest)

1. **In Vercel Dashboard**
   - Go to your project → "Settings" → "Domains"
   - Add `ephileo.us`
   - Vercel will provide nameservers

2. **In GoDaddy**
   - Log in to GoDaddy
   - Go to "My Products" → "Domains"
   - Click on `ephileo.us`
   - Go to "DNS" → "Nameservers"
   - Click "Change Nameservers"
   - Select "Enter my own nameservers (advanced)"
   - Enter Vercel's nameservers:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
   - Click "Save"

3. **Wait for DNS Propagation**
   - Can take 24-48 hours (usually faster)
   - Check status in Vercel dashboard

### Option B: Keep GoDaddy DNS (More Control)

1. **In Vercel Dashboard**
   - Go to your project → "Settings" → "Domains"
   - Add `ephileo.us`
   - Vercel will show you DNS records to add

2. **In GoDaddy DNS Settings**
   - Add an A record:
     - Type: A
     - Name: @
     - Value: `76.76.21.21` (Vercel's IP)
     - TTL: 600

   - Add a CNAME record for www:
     - Type: CNAME
     - Name: www
     - Value: `cname.vercel-dns.com`
     - TTL: 600

3. **Wait for DNS Propagation**
   - Usually takes 1-2 hours
   - Check status: `nslookup ephileo.us`

## Step 6: Configure SSL Certificate

Vercel automatically provides SSL certificates for your domain. No action needed!

## Step 7: Test Everything

1. **Visit your domain**: https://ephileo.us
2. **Test the contact form**: Fill it out and check if email arrives at admin@ephileo.us
3. **Check all project pages**: Click through all 3 projects
4. **Test on mobile**: Ensure responsive design works

## Ongoing Maintenance

### To Update Your Site:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push

# Vercel automatically deploys on every push to main!
```

### View Deployment Logs:
- Vercel Dashboard → Your Project → "Deployments"
- Click on any deployment to see build logs

### Custom Domain Emails:
- If you want email@ephileo.us addresses, consider:
  - Google Workspace (paid)
  - Zoho Mail (free tier available)
  - Or continue using Resend for contact forms only

## Troubleshooting

### Build Fails
- Check Vercel deployment logs
- Common issues:
  - Missing dependencies → Check package.json
  - Type errors → Run `npm run build` locally first
  - Environment variables → Ensure RESEND_API_KEY is set

### Contact Form Not Working
- Verify RESEND_API_KEY is set in Vercel
- Check Resend domain is verified
- Look at Vercel function logs for errors

### Domain Not Working
- Check DNS propagation: https://dnschecker.org
- Verify nameservers or A records are correct
- Wait 24-48 hours for full propagation

### 3D Scene Not Loading
- Check browser console for errors
- Ensure WebGL is supported
- Try different browsers (Chrome, Firefox, Safari)

## Performance Tips

1. **Enable Vercel Analytics** (optional, free tier available)
   - Vercel Dashboard → Your Project → "Analytics"

2. **Monitor Core Web Vitals**
   - Check Vercel deployment dashboard
   - Optimize images if needed

3. **Use Vercel Edge Functions** (already enabled for contact form)

## Cost Estimates

- **Vercel**: Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Custom domains
  - SSL certificates

- **Resend**: Free tier includes:
  - 100 emails/day
  - 3,000 emails/month

- **GoDaddy Domain**: ~$12-15/year (you already have this)

Total: **$0/month** (staying within free tiers) + domain renewal

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Resend Docs: https://resend.com/docs

Need help? Contact your developer or check the documentation above.
