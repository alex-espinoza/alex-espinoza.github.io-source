#!/bin/bash
#
# Builds, prettifies .html pages and deploys the project to S3.
#
# Usage:
#   ./deploy.sh

# Build jekyll static site
JEKYLL_ENV=production jekyll build --lsi

# Remove the .html extension from all blog posts for pretty URLs
for filename in ./_site/*.html; do
    if [ "$filename" != "./_site/index.html" ] && [ "$filename" != "./_site/not-found.html" ]
    then
        original="$filename"

        # Get the filename without the path/extension
        filename=$(basename "$filename")
        extension="${filename##*.}"
        filename="${filename%.*}"

        # Move it
        mv $original ./_site/$filename
    fi
done

# Reset cache-control headers for all images - only do this if images are not being cached
# aws s3 cp s3://giddygourmand.com/ s3://giddygourmand.com/ --exclude "*" --include "*.jpg" --include "*.png" \
# --recursive --metadata-directive REPLACE --expires 2034-01-01T00:00:00Z --acl public-read \
# --cache-control max-age=2592000 --storage-class REDUCED_REDUNDANCY

#Deploy to s3
# s3_website cfg apply
# Use above and push force below if config changes need to be made
s3_website push
# s3_website push --force
