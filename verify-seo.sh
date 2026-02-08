#!/bin/bash

# SEO Verification Script for ResumeGyani.in
# Created: October 4, 2026

echo "🔍 ResumeGyani SEO Verification Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

echo "📝 Step 1: Checking if development server is running..."
if curl -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✓ Development server is running${NC}"
else
    echo -e "${RED}✗ Development server is NOT running${NC}"
    echo "Please start the development server with: npm run dev"
    exit 1
fi

echo ""
echo "🗺️  Step 2: Checking sitemap..."
SITEMAP_URL="$BASE_URL/sitemap.xml"
SITEMAP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SITEMAP_URL")

if [ "$SITEMAP_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Sitemap is accessible${NC}"
    
    # Count blog URLs in sitemap
    BLOG_COUNT=$(curl -s "$SITEMAP_URL" | grep -o "/blog/" | wc -l | tr -d ' ')
    echo "  - Found $BLOG_COUNT blog post URLs in sitemap"
    
    if [ "$BLOG_COUNT" -gt 130 ]; then
        echo -e "${GREEN}  ✓ All blog posts are in sitemap${NC}"
    else
        echo -e "${YELLOW}  ⚠ Expected 132 blog posts, found only $BLOG_COUNT${NC}"
    fi
else
    echo -e "${RED}✗ Sitemap is not accessible (HTTP $SITEMAP_RESPONSE)${NC}"
fi

echo ""
echo "🤖 Step 3: Checking robots.txt..."
ROBOTS_URL="$BASE_URL/robots.txt"
ROBOTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$ROBOTS_URL")

if [ "$ROBOTS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ robots.txt is accessible${NC}"
    
    # Check for sitemap reference
    if curl -s "$ROBOTS_URL" | grep -q "Sitemap:"; then
        echo -e "${GREEN}  ✓ Sitemap is referenced in robots.txt${NC}"
    else
        echo -e "${RED}  ✗ Sitemap is NOT referenced in robots.txt${NC}"
    fi
    
    # Check for blog allowance
    if curl -s "$ROBOTS_URL" | grep -q "Allow: /blog"; then
        echo -e "${GREEN}  ✓ Blog pages are allowed for crawling${NC}"
    else
        echo -e "${YELLOW}  ⚠ Blog pages might not be explicitly allowed${NC}"
    fi
else
    echo -e "${RED}✗ robots.txt is not accessible (HTTP $ROBOTS_RESPONSE)${NC}"
fi

echo ""
echo "📄 Step 4: Checking blog landing page..."
BLOG_URL="$BASE_URL/blog"
BLOG_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BLOG_URL")

if [ "$BLOG_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Blog landing page is accessible${NC}"
    
    # Check for schema markup
    BLOG_HTML=$(curl -s "$BLOG_URL")
    
    if echo "$BLOG_HTML" | grep -q "application/ld+json"; then
        echo -e "${GREEN}  ✓ Schema markup found${NC}"
    else
        echo -e "${RED}  ✗ Schema markup NOT found${NC}"
    fi
    
    # Check for internal links
    INTERNAL_LINKS=$(echo "$BLOG_HTML" | grep -o 'href="/[^"]*"' | wc -l | tr -d ' ')
    echo "  - Found $INTERNAL_LINKS internal links"
    
    if [ "$INTERNAL_LINKS" -gt 20 ]; then
        echo -e "${GREEN}  ✓ Good internal linking structure${NC}"
    else
        echo -e "${YELLOW}  ⚠ Consider adding more internal links${NC}"
    fi
else
    echo -e "${RED}✗ Blog landing page is not accessible (HTTP $BLOG_RESPONSE)${NC}"
fi

echo ""
echo "📰 Step 5: Checking a sample blog post..."
SAMPLE_POST="$BASE_URL/blog/how-to-create-a-standout-resume-in-10-minutes"
POST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SAMPLE_POST")

if [ "$POST_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Sample blog post is accessible${NC}"
    
    POST_HTML=$(curl -s "$SAMPLE_POST")
    
    # Check for FAQ schema
    if echo "$POST_HTML" | grep -q '"@type":"FAQPage"'; then
        echo -e "${GREEN}  ✓ FAQ schema markup found${NC}"
    else
        echo -e "${YELLOW}  ⚠ FAQ schema markup NOT found (might not have FAQs)${NC}"
    fi
    
    # Check for Article schema
    if echo "$POST_HTML" | grep -q '"@type":"BlogPosting"'; then
        echo -e "${GREEN}  ✓ BlogPosting schema markup found${NC}"
    else
        echo -e "${RED}  ✗ BlogPosting schema markup NOT found${NC}"
    fi
    
    # Check for Breadcrumb schema
    if echo "$POST_HTML" | grep -q '"@type":"BreadcrumbList"'; then
        echo -e "${GREEN}  ✓ Breadcrumb schema markup found${NC}"
    else
        echo -e "${RED}  ✗ Breadcrumb schema markup NOT found${NC}"
    fi
    
    # Check for meta description
    if echo "$POST_HTML" | grep -q '<meta name="description"'; then
        echo -e "${GREEN}  ✓ Meta description found${NC}"
    else
        echo -e "${RED}  ✗ Meta description NOT found${NC}"
    fi
    
    # Check for Open Graph tags
    if echo "$POST_HTML" | grep -q 'property="og:'; then
        echo -e "${GREEN}  ✓ Open Graph tags found${NC}"
    else
        echo -e "${RED}  ✗ Open Graph tags NOT found${NC}"
    fi
    
    # Check for Twitter Card tags
    if echo "$POST_HTML" | grep -q 'name="twitter:'; then
        echo -e "${GREEN}  ✓ Twitter Card tags found${NC}"
    else
        echo -e "${RED}  ✗ Twitter Card tags NOT found${NC}"
    fi
else
    echo -e "${RED}✗ Sample blog post is not accessible (HTTP $POST_RESPONSE)${NC}"
fi

echo ""
echo "🔗 Step 6: External validation tools..."
echo "Please manually verify using these tools:"
echo ""
echo "1. Google Rich Results Test:"
echo "   https://search.google.com/test/rich-results?url=$BASE_URL/blog"
echo ""
echo "2. Schema Markup Validator:"
echo "   https://validator.schema.org/"
echo "   (Paste HTML from: curl $SAMPLE_POST)"
echo ""
echo "3. Google Search Console:"
echo "   https://search.google.com/search-console"
echo "   Submit sitemap: https://resumegyani.in/sitemap.xml"
echo ""
echo "4. PageSpeed Insights:"
echo "   https://pagespeed.web.dev/?url=https://resumegyani.in/blog"
echo ""

echo ""
echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "1. Deploy these changes to production"
echo "2. Submit sitemap to Google Search Console"
echo "3. Monitor indexing status over next 2-4 weeks"
echo "4. Check SEO_IMPROVEMENTS_2025.md for detailed action plan"
echo ""

