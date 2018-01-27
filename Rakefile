task default: :test

desc "Test examples in spec files"
task :test do
  sh %(bundle exec scripts/extract-examples.rb spec/latest/json-ld/index.html spec/latest/json-ld-api/index.html spec/latest/json-ld-framing/index.html)
end

desc "Extract Examples"
task :examples => [:examples_syntax, :examples_api, :examples_framing]

task :examples_syntax do
  sh %(bundle exec scripts/extract-examples.rb --example-dir examples/syntax spec/latest/json-ld/index.html)
end

task :examples_api do
  sh %(bundle exec scripts/extract-examples.rb --example-dir examples/api spec/latest/json-ld-api/index.html)
end

task :examples_framing do
  sh %(bundle exec scripts/extract-examples.rb --example-dir examples/framing spec/latest/json-ld-framing/index.html)
end
