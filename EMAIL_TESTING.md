# Email Testing Guide

## ✅ Email Setup is Complete!

The contact form is now configured to send emails using Resend.

## 🧪 Testing the Contact Form

### 1. Test Locally (http://localhost:3001)

1. **Navigate to the contact form**
   - Scroll down to the "Get in Touch" section
   - Or click "Contact" in the navigation

2. **Fill out the form**
   - Name: Your name
   - Email: Your email (where you want to receive the test)
   - Message: Test message

3. **Submit and check**
   - Click "Send Message"
   - You should see a success message
   - Check your email at the address you entered

### 2. Current Configuration

**From Email:** `onboarding@resend.dev` (Resend's test domain)
- ✅ Works immediately without domain verification
- ✅ Perfect for testing

**To Email:** `admin@ephileo.us`
- This is where form submissions will be sent
- Change this in `.env.local` if you want to use a different email

## 🔧 Troubleshooting

### If email doesn't send:

1. **Check browser console (F12)**
   - Look for any error messages

2. **Check server logs**
   - In your terminal where `npm run dev` is running
   - Look for "Resend API error" messages

3. **Verify API Key**
   - Make sure your Resend API key is correct in `.env.local`
   - Key: `re_hmtT8iEK_74H6kByAw61zTG48vB4VnvVC`

4. **Common Issues:**
   - API key not set → Check `.env.local` exists
   - Server not reloaded → Restart dev server (`Ctrl+C`, then `npm run dev`)
   - Resend API limits → Free tier: 100 emails/day, 3,000/month

## 🚀 For Production (After Deployment)

### Option A: Continue Using Test Domain
Keep using `onboarding@resend.dev` - works fine for production too!

### Option B: Use Your Custom Domain

1. **Verify ephileo.us in Resend**
   - Go to https://resend.com/domains
   - Add `ephileo.us`
   - Add DNS records to GoDaddy:
     - SPF record (TXT)
     - DKIM record (TXT)

2. **Update Environment Variables**
   In Vercel (after deployment):
   ```
   RESEND_FROM_EMAIL=noreply@ephileo.us
   CONTACT_TO_EMAIL=admin@ephileo.us
   ```

3. **Benefits of verified domain:**
   - Professional sender address
   - Better email deliverability
   - No "via resend.dev" in email headers

## 📋 Environment Variables Reference

### `.env.local` (Local Development)
```bash
RESEND_API_KEY=re_hmtT8iEK_74H6kByAw61zTG48vB4VnvVC
RESEND_FROM_EMAIL=onboarding@resend.dev
CONTACT_TO_EMAIL=admin@ephileo.us
```

### Vercel (Production)
Add these in Vercel Dashboard → Settings → Environment Variables:
```
RESEND_API_KEY=re_hmtT8iEK_74H6kByAw61zTG48vB4VnvVC
RESEND_FROM_EMAIL=onboarding@resend.dev
CONTACT_TO_EMAIL=admin@ephileo.us
```

## 📧 Email Template

When someone submits the form, you'll receive an email like this:

**From:** Ephileo Contact Form <onboarding@resend.dev>
**To:** admin@ephileo.us
**Reply-To:** [user's email]
**Subject:** New Contact Form Submission from [user's name]

**Body:**
```
New Contact Form Submission

Name: [user's name]
Email: [user's email]
Message:
[user's message]
```

You can reply directly to the email and it will go to the user's email address!

## 🔒 Security Notes

- ✅ API key is stored in environment variables (not in code)
- ✅ Input validation (name, email, message required)
- ✅ Email format validation
- ✅ Server-side processing only
- ✅ Rate limiting via Resend (prevents spam)

## 📊 Monitoring

### Check Email Sending in Resend Dashboard
1. Go to https://resend.com/emails
2. See all sent emails
3. Check delivery status
4. View email content

## 💡 Tips

1. **Test with your own email first** to make sure it works
2. **Check spam folder** if you don't receive the email
3. **Use Resend dashboard** to debug if emails aren't sending
4. **Keep the test domain** for simplicity (no domain verification needed)

## 🎉 You're All Set!

The contact form is ready to use. Test it now at http://localhost:3001!
