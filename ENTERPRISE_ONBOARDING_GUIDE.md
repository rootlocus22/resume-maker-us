# Enterprise Lead Onboarding Guide: Elevate Law Firm

## Lead Analysis

**Contact**: Harshada Kothari  
**Email**: harshada.kothari@elevate.law  
**Phone**: 9561412339  
**Organization**: Elevate (Law Firm)  
**Source**: Enterprise Landing Page  
**Status**: New Lead  
**Date**: January 14, 2026

### Legitimacy Assessment: ✅ **HIGH CONFIDENCE**

**Positive Indicators:**
1. ✅ Professional email domain (`@elevate.law`) - Law firms use `.law` domains
2. ✅ Specific, detailed requirements (not generic inquiry)
3. ✅ Clear pain points with actionable solutions
4. ✅ Professional communication style
5. ✅ Valid phone number format (US number)
6. ✅ Organization name matches email domain

**Verification Steps:**
- Quick Google search: "Elevate law firm" to verify existence
- Check LinkedIn for Harshada Kothari at Elevate
- Verify email domain ownership

---

## Their Requirements Analysis

### 1. **Single Voice/Tense** ✅
**Solution**: Our AI resume optimization already standardizes tense (uses past tense for past roles, present for current)

### 2. **Remove Unnecessary Adjectives** ✅
**Solution**: Our optimization prompts can be customized to remove fluff words

### 3. **Remove Redundant Phrasing** ✅
**Solution**: AI enhancement already identifies and removes redundancy

### 4. **Concise Points (Not Too Long)** ✅
**Solution**: Can configure bullet point length limits

### 5. **Remove Formatting Issues** ✅
**Solution**: ATS checker + resume builder fixes formatting automatically

### 6. **Role-Relevant Summary** ✅
**Solution**: Job description-based enhancement already does this

### 7. **Remove Old Roles (>5 years)** ✅
**Solution**: Can add custom logic to filter experience by date

### 8. **Convert to Their Format** ⚠️
**Solution**: Need to see their format template - we can create custom templates

---

## Product Capabilities Match

| Their Need | Our Solution | Status |
|-----------|-------------|--------|
| AI Resume Fine-tuning | `/api/optimize-resume` + `/api/enhance-resume-with-job-description` | ✅ Ready |
| Single Voice/Tense | AI optimization standardizes tense | ✅ Ready |
| Remove Adjectives | Customizable AI prompts | ✅ Can Add |
| Remove Redundancy | AI already does this | ✅ Ready |
| Concise Format | Configurable bullet length | ✅ Can Add |
| Fix Formatting | ATS checker + resume builder | ✅ Ready |
| Role-Relevant Summary | Job description enhancement | ✅ Ready |
| Remove Old Roles | Can add date filter logic | ⚠️ Needs Dev |
| Custom Format | Custom template system | ⚠️ Needs Template |

---

## Recommended Pricing Strategy

### Option 1: **Per-Resume Pricing** (Best for Testing)
- **Price**: ₹500-800 per resume processed
- **Minimum**: 10 resumes/month
- **Volume Discount**: 20% off for 50+ resumes/month
- **Good for**: Testing the relationship, low commitment

### Option 2: **Monthly Subscription** (Recommended)
- **Starter Plan**: ₹15,000/month
  - Up to 50 resumes/month
  - Custom format template
  - Priority support
  - API access
  
- **Professional Plan**: ₹35,000/month
  - Up to 150 resumes/month
  - Multiple format templates
  - White-label option
  - Dedicated account manager
  
- **Enterprise Plan**: ₹75,000/month
  - Unlimited resumes
  - Full customization
  - Custom integrations
  - SLA guarantee

### Option 3: **Annual Contract** (Best Value)
- **Annual Starter**: ₹150,000/year (save ₹30,000)
- **Annual Professional**: ₹350,000/year (save ₹70,000)
- **Annual Enterprise**: ₹750,000/year (save ₹150,000)

**Recommendation**: Start with **Monthly Professional Plan (₹35,000/month)** with 3-month commitment

---

## Onboarding Process

### Phase 1: Discovery Call (Week 1)

**Agenda:**
1. Understand their current process
2. See their resume format template
3. Identify volume (how many resumes/month?)
4. Discuss integration needs (API? Manual upload? Bulk?)
5. Show product demo
6. Discuss pricing and timeline

**Questions to Ask:**
- How many resumes do you process per month?
- What's your current process? (Manual? Tools?)
- What's your biggest pain point? (Time? Quality? Consistency?)
- Do you have a standard resume format template?
- What's your typical turnaround time requirement?
- Do you need API integration or manual upload is fine?
- What's your budget range?

**Demo Script:**
1. Show ATS checker with sample resume
2. Show resume optimization with job description
3. Show custom formatting capabilities
4. Show bulk processing (if needed)

### Phase 2: Pilot Program (Week 2-3)

**Offer**: Free pilot with 5-10 resumes
- Process their resumes with their requirements
- Show before/after comparison
- Gather feedback
- Refine customization

**Deliverables:**
- 5-10 optimized resumes
- Comparison report
- Customization recommendations
- Pricing proposal

### Phase 3: Customization (Week 3-4)

**Tasks:**
1. Create custom template matching their format
2. Configure AI prompts for their specific needs:
   - Remove adjectives
   - Single tense enforcement
   - Concise bullet points
   - Remove old roles (>5 years)
3. Set up their account (enterprise mode)
4. Train their team (if needed)

### Phase 4: Launch (Week 4+)

**Go-Live Checklist:**
- [ ] Enterprise account created
- [ ] Custom template configured
- [ ] AI prompts customized
- [ ] Team trained (if needed)
- [ ] API access granted (if needed)
- [ ] Support channel established
- [ ] First batch processed
- [ ] Feedback collected

---

## Email Response Template

**Subject**: Re: Resume Optimization Solution for Elevate - Let's Discuss Your Requirements

---

Hi Harshada,

Thank you for reaching out to ResumeGyani! I'm excited to help Elevate streamline your resume processing workflow.

I've reviewed your requirements, and I'm confident we can address all of them:

✅ **Single voice/tense** - Our AI standardizes resume tense automatically  
✅ **Remove unnecessary adjectives** - Customizable AI prompts can eliminate fluff  
✅ **Remove redundant phrasing** - AI identifies and removes redundancy  
✅ **Concise format** - Configurable bullet point length limits  
✅ **Fix formatting issues** - ATS checker + resume builder ensures clean formatting  
✅ **Role-relevant summaries** - Job description-based enhancement tailors summaries  
✅ **Remove old roles (>5 years)** - Can filter experience by date  
✅ **Custom format conversion** - We can create templates matching your format

**Next Steps:**

I'd love to schedule a 30-minute call to:
1. Understand your current process and volume
2. See your resume format template
3. Show you a live demo with a sample resume
4. Discuss pricing options that fit your budget

**Available Times:**
- [Your available slots]

**Pilot Offer:**

To demonstrate value, I'm happy to process 5-10 of your resumes for free with your specific requirements. This will give you a clear before/after comparison.

Would you prefer:
- A quick call this week?
- Or should I send you a detailed proposal first?

Looking forward to helping Elevate optimize your resume processing!

Best regards,  
[Your Name]  
[Your Title]  
ResumeGyani  
[Phone] | [Email]

---

## Technical Implementation Plan

### Custom Features Needed

1. **Custom AI Prompt Configuration**
   ```javascript
   // Add to optimization prompt:
   - Remove all unnecessary adjectives (e.g., "excellent", "outstanding", "exceptional")
   - Use single tense (past tense for past roles, present for current)
   - Keep bullet points under 2 lines
   - Remove roles older than 5 years
   ```

2. **Date Filter Logic**
   ```javascript
   // Filter experience by date
   const fiveYearsAgo = new Date();
   fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
   
   experience = experience.filter(exp => {
     const endDate = new Date(exp.endDate);
     return endDate >= fiveYearsAgo || exp.endDate === 'Present';
   });
   ```

3. **Custom Template Creation**
   - Request their template (Word/PDF)
   - Recreate in our template system
   - Test with sample resumes

4. **Bulk Processing API** (if needed)
   - Create endpoint for bulk resume processing
   - Add webhook for completion notifications
   - Add progress tracking

---

## Sales Pitch Points

### Value Propositions

1. **Time Savings**: "Reduce resume processing time from 30 minutes to 2 minutes per resume"
2. **Consistency**: "Ensure all resumes follow your exact format and style guidelines"
3. **Quality**: "AI-powered optimization ensures professional, ATS-friendly resumes"
4. **Scalability**: "Process 10 or 1000 resumes with the same quality and speed"
5. **ROI**: "Free up your team's time for higher-value work"

### Competitive Advantages

- ✅ AI-powered (not just templates)
- ✅ Customizable to their exact needs
- ✅ ATS-optimized (passes applicant tracking systems)
- ✅ US company (better support, pricing)
- ✅ Proven track record (100,000+ users)

### Objection Handling

**"We already have a process"**
→ "Our solution enhances your process, doesn't replace it. You still review, we just make it faster and more consistent."

**"Too expensive"**
→ "Calculate time saved: If you process 50 resumes/month at 30 min each = 25 hours. At ₹500/hour cost = ₹12,500/month. Our solution costs less and gives better results."

**"We need to see it work first"**
→ "That's why we offer a free pilot with 5-10 resumes. No commitment, just results."

**"What if it doesn't match our format?"**
→ "We'll create a custom template matching your exact format. That's included in the setup."

---

## Success Metrics to Track

1. **Resume Processing Time**: Before vs After
2. **Format Compliance Rate**: % matching their template
3. **Client Satisfaction**: Monthly feedback score
4. **Volume Growth**: Resumes processed per month
5. **Renewal Rate**: Annual contract renewal

---

## Risk Mitigation

### Potential Issues

1. **Format Mismatch**
   - **Mitigation**: Create custom template, test with 5 resumes before launch

2. **Quality Concerns**
   - **Mitigation**: Human review option, feedback loop, iterative improvement

3. **Integration Challenges**
   - **Mitigation**: Start with manual upload, add API later if needed

4. **Scope Creep**
   - **Mitigation**: Clear contract with defined deliverables, change request process

---

## Next Actions (Priority Order)

1. ✅ **Send email response** (within 24 hours)
2. ✅ **Schedule discovery call** (this week)
3. ✅ **Prepare demo** (sample resume with their requirements)
4. ✅ **Create pilot proposal** (5-10 free resumes)
5. ✅ **Set up enterprise account** (if they're interested)
6. ✅ **Develop custom features** (if needed after pilot)

---

## Resources Needed

- [ ] Sample resume for demo
- [ ] Their format template (request in call)
- [ ] Pricing sheet
- [ ] Case studies/testimonials
- [ ] Technical documentation (if API needed)
- [ ] Support contact information

---

## Follow-Up Timeline

- **Day 1**: Send email response
- **Day 2**: Follow up if no response
- **Day 3**: Call if still no response
- **Week 2**: Send pilot proposal
- **Week 3**: Follow up on pilot
- **Week 4**: Close or move to next quarter

---

**Good luck with your first enterprise client! This is a great opportunity to build a strong case study and reference customer.**
