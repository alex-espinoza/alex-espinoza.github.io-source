## TODO

## Usage

**Note:** If you're not familiar with Jekyll, please read up on [Jekyll's documentation](http://jekyllrb.com/) first.

```
bundle install
jekyll serve
```

## Deploying to production

* Make changes in the *source* branch
* Build and test the site locally via `jekyll build` then `jekyll serve` (accessible at localhost:4000)
* Commit changes to *source* branch
* `git publish-website` which consists of the following steps
  - `git branch -D master`
  - `git checkout -b master`
  - `git filter-branch --subdirectory-filter _site/ -f`
  - `git checkout source`
  - `git push --all origin`

Done!!
