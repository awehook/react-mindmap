if [ ! -d react-mindmap ]; then
    if [ -d build ]; then
        cp -r build react-mindmap
    else 
        echo "No folder build! Please run \"npm run build\" to build"
        exit 0
    fi
fi 
python3 -m http.server