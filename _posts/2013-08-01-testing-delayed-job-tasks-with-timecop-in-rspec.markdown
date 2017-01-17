---
layout: post
title:  "Testing time sensitive delayed_job tasks with timecop in RSpec | alex espinoza"
post_title:  "Testing time sensitive delayed_job tasks with timecop in RSpec"
date:   2013-08-01 01:00:01
categories: jekyll update
---

I had an issue testing time sensitive delayed_job tasks with timecop using RSpec. I have a method that posts tweets at a scheduled time that is queued using delayed_job. Timecop's `travel` method should take care of this and run the queued job after it passes the tweet's scheduled time, but it wasn't working. Here is how my test looked like:

{% highlight ruby %}
describe '- will be tweeted -' do
  before(:each) do
    test_time = Time.utc(2013, 8, 3, 18, 0, 0)
    Timecop.freeze(test_time)
  end

  after(:each) { Timecop.return }

  it 'only at the time specified by its scheduled_time column.' do
    valid_sign_in_via_twitter
    valid_tweet_form_input
    expect(Delayed::Job.count).to eq(1)
    scheduled_time_of_test_tweet = Time.utc(2013, 8, 4, 18, 0, 0)
    expect(Tweet.first.scheduled_time).to eq(scheduled_time_of_test_tweet)
    Timecop.travel(Time.now + 5.days)
    expect(Delayed::Job.count).to eq(0)
    expect(Tweet.first.was_tweeted).to eq(true)
  end
end
{% endhighlight %}

Before the test is run, I used timecop to `freeze` the time at August 3, 2013 18:00 UTC. The `valid_tweet_form_input` method schedules a tweet to be posted at August 4, 2013 18:00 UTC. Inside the test I call `Timecop.travel(Time.now + 5.days)` which brings the time to August 8, 2013 18:00 UTC, which means the queued job should have been run. My test was failing at `expect(Delayed::Job.count).to eq(0)`.

After much trial and error, and reading the delayed_job and timecop documentation, [I came across this helpful post on StackOverflow.][stacklink] Turns out that delayed_job has a way to process everything that is in the job queue and return the number of jobs that succeeded and failed using `Delayed::Worker.new.work_off`. Let's implement that into the test:

{% highlight ruby %}
it 'only at the time specified by its scheduled_time column.' do
  valid_sign_in_via_twitter
  valid_tweet_form_input
  expect(Delayed::Job.count).to eq(1)
  scheduled_time_of_test_tweet = Time.utc(2013, 8, 4, 18, 0, 0)
  expect(Tweet.first.scheduled_time).to eq(scheduled_time_of_test_tweet)
  Timecop.travel(Time.now + 5.days)
  successes, failures = Delayed::Worker.new.work_off
  expect(successes).to eq(1)
  expect(failures).to eq(0)
  expect(Delayed::Job.count).to eq(0)
  expect(Tweet.first.was_tweeted).to eq(true)
end
{% endhighlight %}

Voilà, a green test suite. I can confirm this is working correctly as I had another test that checked that a tweet would not be posted if the `scheduled_time` did not yet happen. With that test, `successes` and `failures` were both 0 as the queued job's time did not happen and so the `Delayed::Job.count` was still at 1.

[stacklink]: http://stackoverflow.com/a/7073027/1447611
