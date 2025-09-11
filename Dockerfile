# Dockerfile (rails backend)
FROM ruby:3.2-slim

# system dependencies
RUN apt-get update -qq && \
    apt-get install -y build-essential libpq-dev nodejs npm libyaml-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /myapp

# Gemfiles will be copied by rails new or later
COPY Gemfile Gemfile.lock ./

RUN gem install bundler -v 2.4.13 || true
RUN bundle install --jobs 4

COPY . .

# Use entrypoint to wait for db later (optional)
CMD ["bash", "-lc", "rm -f tmp/pids/server.pid && bundle exec rails server -b 0.0.0.0 -p 3000"]
