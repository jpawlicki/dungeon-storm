find ./assets -not -path '*/.*' -type f -not -name '*.sh'
find . -maxdepth 1 -path "*.js" -not -path '*/.*' -type f -not -name '*.sh'
find ./rendering -not -path '*/.*' -type f -not -name '*.sh'
find ./tools -not -path '*/.*' -type f -not -name '*.sh'
find . -maxdepth 1 -path "*.html" -not -path '*/.*' -type f -not -name '*.sh'