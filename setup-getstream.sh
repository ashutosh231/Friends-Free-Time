#!/bin/bash

# 🚀 Quick Setup Script for GetStream Chat Integration

echo "🎉 Friends Timetable - GetStream Chat Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if API key is configured
API_KEY=$(grep "STREAM_API_KEY = '" src/chatConfig.js | cut -d "'" -f 2)

if [ "$API_KEY" = "YOUR_STREAM_API_KEY" ]; then
    echo "${YELLOW}⚠️  GetStream API Key not configured yet!${NC}"
    echo ""
    echo "📋 Steps to get your API key:"
    echo "1. Visit: https://getstream.io/chat/"
    echo "2. Sign up (FREE - no credit card needed)"
    echo "3. Create an app"
    echo "4. Copy your API Key"
    echo "5. Update src/chatConfig.js"
    echo ""
    echo "📖 Check GETSTREAM_SETUP.md for detailed instructions"
    echo ""
    read -p "Press Enter to continue..."
fi

echo ""
echo "🔄 Switching to GetStream version..."

# Backup current App.jsx if it exists and is different from GetStream version
if [ -f "src/App.jsx" ] && ! cmp -s "src/App.jsx" "src/App-GetStream.jsx"; then
    echo "📦 Backing up current App.jsx..."
    cp src/App.jsx src/App-LocalStorage-Backup.jsx
    echo "${GREEN}✅ Backup created: src/App-LocalStorage-Backup.jsx${NC}"
fi

# Copy GetStream version
echo "📝 Copying GetStream version..."
cp src/App-GetStream.jsx src/App.jsx
echo "${GREEN}✅ App.jsx updated with GetStream integration${NC}"

# Check if main.jsx includes chat-custom.css
if ! grep -q "chat-custom.css" src/main.jsx; then
    echo "📝 Updating main.jsx to include chat styles..."
    
    # Create backup
    cp src/main.jsx src/main.jsx.backup
    
    # Add chat-custom.css import after index.css
    sed -i.bak "/import '\.\/index\.css'/a\\
import './chat-custom.css'
" src/main.jsx && rm src/main.jsx.bak
    
    echo "${GREEN}✅ main.jsx updated${NC}"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo ""

if [ "$API_KEY" = "YOUR_STREAM_API_KEY" ]; then
    echo "${YELLOW}1. Configure your GetStream API key:${NC}"
    echo "   - Get it from: https://getstream.io/chat/"
    echo "   - Update: src/chatConfig.js"
    echo ""
fi

echo "2. Start development server:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "3. Test in two different browsers:"
echo "   - Browser 1: Login as 'ashutosh'"
echo "   - Browser 2: Login as 'dhruv'"
echo "   - Send messages - they should sync instantly! ⚡"
echo ""
echo "4. Build for production:"
echo "   ${GREEN}npm run build${NC}"
echo ""
echo "📖 For detailed instructions, check:"
echo "   - GETSTREAM_SETUP.md"
echo "   - MIGRATION_GUIDE.md"
echo ""
echo "🎊 Enjoy your new real-time chat!"
