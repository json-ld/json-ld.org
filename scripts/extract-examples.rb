#!/usr/bin/env ruby
# Extracts examples from a ReSpec document, verifies that example titles are unique. Numbering attempts to replicate that used by ReSpec. Examples in script elements, which are not visibile, may be used for describing the results of related examples
require 'getoptlong'
require 'json'
require 'nokogiri'
require 'linkeddata'
require 'fileutils'
require 'colorize'

example_dir = nil
opts = GetoptLong.new(
  ["--example-dir", GetoptLong::REQUIRED_ARGUMENT]
)
opts.each do |opt, arg|
  case opt
  when '--example-dir'  then example_dir = arg
  end
end

num_errors = 0

ARGV.each do |input|
  $stdout.puts "\ninput: #{input}"
  example_number = 0
  examples = {}
  errors = []
  warnings = []

  File.open(input, "r") do |f|
    doc = Nokogiri::HTML.parse(f.read)
    doc.css(".example").each do |element|
      warn = false
      example_number += 1 if element.name == "pre"

      if element.attr('data-ignore') || element.name == "table"
        $stdout.write "i".colorize(:yellow)
        next
      end

      if (title = element.attr('title')).to_s.empty?
        errors << "Example #{example_number} at line #{element.line} has no title"
        $stdout.write "F".colorize(:red)
        next
      end

      if examples.any? {|n, ex| ex[:title] == title}
        warnings << "Example #{example_number} at line #{element.line} uses duplicate title: #{title}"
        warn = true
      end

      content = element.inner_html.
        sub(/^\s*<!--\s*/m, '').
        sub(/s*-->\s*$/m, '').
        gsub('****', '').
        gsub(/####([^#]*)####/, '')

      ext = case element.attr('data-content-type')
      when nil, '' then "json"
      when 'application/n-quads', 'nq' then 'nq'
      when 'text/html', 'html' then 'html'
      when 'text/turtle', 'ttl' then 'ttl'
      else 'txt'
      end

      # Perform example syntactic validation based on extension
      case ext
      when 'json'
        begin
          ::JSON.parse(content)
        rescue JSON::ParserError => e
          errors << "Example #{example_number} at line #{element.line} parse error: #{e.message}"
          $stdout.write "F".colorize(:red)
          next
        end
      when 'html'
        begin
          doc = Nokogiri::HTML.parse(content) {|c| c.strict}
          doc.errors.each do |e|
            errors << "Example #{example_number} at line #{element.line} parse error: #{e}"
          end
          unless doc.errors.empty?
            $stdout.write "F".colorize(:red)
            next
          end
        rescue Nokogiri::XML::SyntaxError => e
          errors << "Example #{example_number} at line #{element.line} parse error: #{e.message}"
          $stdout.write "F".colorize(:red)
          next
        end
      when 'ttl'
        begin
          reader_errors = []
          RDF::Turtle::Reader.new(content, logger: reader_errors) {|r| r.validate!}
        rescue
          reader_errors.each do |e|
            errors << "Example #{example_number} at line #{element.line} parse error: #{e}"
          end
          $stdout.write "F".colorize(:red)
          next
        end
      when 'nq'
        begin
          reader_errors = []
          RDF::NQuads::Reader.new(content, logger: reader_errors) {|r| r.validate!}
        rescue
          reader_errors.each do |e|
            errors << "Example #{example_number} at line #{element.line} parse error: #{e}"
          end
          $stdout.write "F".colorize(:red)
          next
        end
      end

      case element.name
      when "pre"
        fn = "example-#{"%03d" % example_number}-#{title.gsub(/[^\w]+/, '-')}.#{ext}"
        examples[example_number] = {
          title: title,
          filename: fn,
          content: content
        }
        #puts "example #{example_number}: #{content}"
      when "script"
        # Validate the previous example appropriately
      else
        errors << "Example #{example_number} at line #{element.line} has unknown element type #{element.name}"
        $stdout.write "F".colorize(:red)
        next
      end

      if warn
        $stdout.write "w".colorize(:yellow)
      else
        $stdout.write ".".colorize(:green)
      end
    end
  end

  $stdout.puts "\nWarnings:" unless warnings.empty?
  warnings.each {|e| $stdout.puts "  #{e}".colorize(:yellow)}
  $stdout.puts "\nErrors:" unless errors.empty?
  errors.each {|e| $stdout.puts "  #{e}".colorize(:red)}
  num_errors += errors.length

  if example_dir
    # Make examples directory
    FileUtils::mkdir_p(example_dir)
    examples.each do |num, ex|
      File.open(File.join(example_dir, ex[:filename]), 'w') {|f| f.write(ex[:content])}
    end
  end
end

if num_errors == 0
  $stdout.puts "\nok".colorize(:green)
else
  exit(1)
end

exit(0)