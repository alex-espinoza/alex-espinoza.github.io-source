---
layout: post
title:  "Using Shoryuken (Amazon SQS) with Rails | alex espinoza"
post_title:  "Using Shoryuken (Amazon SQS) with Rails"
date:   2015-04-11 01:00:01
categories: jekyll update
---

Setting up queueing for background jobs is a pretty typical task in Rails. I usually use Sidekiq or Resque to get this done, but I was recently tasked with working with Amazon SQS. Fortunately, there is a gem called [Shoryuken][shoryuken] that will help us work with it. If you know how to set up Sidekiq and create workers, this will be extremely familiar. In this tutorial, I'll be fetching and saving some Instagram posts via a rake task using their [API wrapper gem][instagram].

First, let's get everything set up on the Amazon side. Log in to your Amazon AWS account and click on **SQS** under **Application Services**. Click on **Create New Queue** and enter a queue name. I'll be using **post_test** as the queue name for this tutorial. I'll also be using the default queue settings provided.

Onto the Shoryuken side of things. Add `gem "shoryuken"` to your Gemfile and run `bundle install`.

Let's create the worker class that will get and save the Instagram posts. It will live in our `app/workers` directory. I'll be saving it as `instagram_worker.rb`:

{% highlight ruby %}
class InstagramWorker
  include Shoryuken::Worker

  shoryuken_options queue: "post_test", auto_delete: true, body_parser: :json

  def perform(sqs_msg, data)
    post = Instagram.media_item(data["post"])

    new_post = Post.new({
      content_type: post.type,
      text: post.caption,
      instagram_media_id: post.id
    })

    new_post.image_from_url(post.images.standard_resolution.url)
    new_post.save!
  end
end
{% endhighlight %}

I'll get into the `shoryuken_options` used above in a bit. Next, let's set up the rake task which will fetch the list of Instagram posts by user and enqueue jobs.

{% highlight ruby %}
require "rails"
require "net/http"

task :get_new_instagram_posts => [:environment] do
  def get_newest_media(user)
    id = Instagram.user_search(user).first.id

    Instagram.user_recent_media(id).each do |post|
      create_post(post.id)
    end
  end

  def create_post(post_id)
    InstagramWorker.perform_async(post: post_id)
  end

  active_users = ["instagram_username1", "instagram_username2", "instagram_username3"]
  active_users.each do |user|
    get_newest_media(user)
  end
end
{% endhighlight %}

The `InstagramWorker.perform_async(post: post_id)` call will queue the creation of a new post and save the `post_id` in our **post_test** SQS queue. Our worker will read the data we sent to the queue as JSON and get the post id using `data["post"]`. It will then automatically delete the job only once it is successfully completed.

Next, we need to create our `shoryuken.yml` config file, which will be saved in `app/config`:

{% highlight ruby %}
aws:
  access_key_id: <%= ENV["AWS_ACCESS_KEY_ID"] %>
  secret_access_key: <%= ENV["AWS_SECRET_ACCESS_KEY"] %>
  region: <%= ENV["AWS_REGION"] %>
concurrency: 10
queues:
  - post_test
{% endhighlight %}

[You can read more about configuring shoryuken.yml in the README][s-config]. I used the [dot-env gem][env] to save my AWS access keys.

Now with everything done, we just need to run the Shoryuken process with `bundle exec shoryuken -R -C config/shoryuken.yml` inside the Rails app directory. The `-R` flag will load the Rails app and read all the worker classes inside `app/workers`.

In another window, running `rake get_new_instagram_posts` will get everything started. You can see the data pass through SQS if you go to the Amazon SQS console, right click on your queue name, select **View/Delete Messages** and then click on the **Start Polling for Messages** button. This is also one way to debug issues and make sure the correct data you need is being passed through to your worker.

Deploying will be different depending on where you host your production app, but I would start with reading the [Deployment][s-deploy] section of the wiki. You will also need to change your `shoryuken.yml` config settings and your SQS queue settings based on your app's needs.

All in all, Shoryuken is as easy to use and set up as Sidekiq. It is in active development and has a lot of the same features such as time delaying, ActiveJob support, load balancing, and more. Learn more about it by reading the [README][shoryuken] and the [wiki][s-wiki]. Happy queueing.

[shoryuken]: https://github.com/phstc/shoryuken
[s-config]: https://github.com/phstc/shoryuken#configuration
[env]: https://github.com/bkeepers/dotenv
[s-deploy]: https://github.com/phstc/shoryuken/wiki/Deployment
[s-wiki]: https://github.com/phstc/shoryuken/wiki
[instagram]: https://github.com/Instagram/instagram-ruby-gem
