#!/usr/bin/env rackup
require 'sinatra'

require 'sinatra/base'

class MyApp < Sinatra::Base
  set :static, true
  set :root, File.expand_path("..", __FILE__)
  set :public, File.expand_path("..", __FILE__)
  get '/' do
    "Hello World"
  end
end

run MyApp