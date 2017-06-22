#!/usr/bin/env ruby

require 'bundler'
require 'pathname'
require 'time'

# ########################################
# Constants

PROJECTS = %w[
  stash-wrapper
  stash-harvester
  stash-sword
  stash-merritt
  stash_engine
  stash_engine_specs
  stash_discovery
  stash_datacite
  stash_datacite_specs
].freeze

STASH_ROOT = Pathname.new(__dir__)

TRAVIS_PREP_SH = 'travis-prep.sh'.freeze

IN_TRAVIS = ENV['TRAVIS'] == 'true' ? true : false

# ########################################
# Helper methods

def tmp_path
  @tmp_path ||= begin
    tmpdir = File.absolute_path("builds/#{Time.now.utc.iso8601}")
    FileUtils.mkdir_p(tmpdir)
    puts "logging build output to #{tmpdir}"
    Pathname.new(tmpdir)
  end
end

def run_task(task_name, shell_command)
  return travis_fold(task_name) { system(shell_command) } if IN_TRAVIS

  log_file = tmp_path + "#{task_name}.out"
  build_ok = redirect_to(shell_command, log_file)
  return build_ok if build_ok

  $stderr.puts("#{shell_command} failed")
  system("cat #{log_file}")

  false
end

def travis_fold(task_name)
  puts "travis_fold:start:#{task_name}"
  yield
ensure
  puts "travis_fold:end:#{task_name}"
end

def redirect_to(shell_command, log_file)
  if /(darwin|bsd)/ =~ RUBY_PLATFORM
    system("script -q #{log_file} #{shell_command} > /dev/null")
  else
    system("script -q -c'#{shell_command}' -e #{log_file} > /dev/null")
  end
rescue => ex
  $stderr.puts("#{shell_command} failed: #{ex}")
  false
end

def dir_for(project)
  STASH_ROOT + project
end

def in_project(project)
  Dir.chdir(dir_for(project)) { yield }
end

# ########################################
# Build steps

def bundle(project)
  Bundler.with_clean_env do
    in_project(project) do
      run_task("bundle-#{project}", 'bundle install')
    end
  end
rescue => e
  $stderr.puts(e)
  return false
end

def prepare(project)
  in_project(project) do
    travis_prep_sh = "./#{TRAVIS_PREP_SH}"
    puts("No prep script #{File.absolute_path(travis_prep_sh)}") unless travis_prep_sh
    return true unless File.exist?(travis_prep_sh)
    unless FileTest.executable?(travis_prep_sh)
      $stderr.puts("prepare failed: #{File.absolute_path(travis_prep_sh)} is not executable")
      return false
    end
    run_task("prepare-#{project}", travis_prep_sh)
  end
rescue => e
  $stderr.puts(e)
  return false
end

def build(project)
  in_project(project) do
    run_task("build-#{project}", 'bundle exec rake')
  end
rescue => e
  $stderr.puts(e)
  return false
end

def bundle_all
  PROJECTS.each do |p|
    bundle_ok = bundle(p)
    $stderr.puts("#{p} bundle failed") unless bundle_ok
    exit(1) unless bundle_ok
  end
  true
end

def build_all
  build_succeeded = []
  build_failed = []
  PROJECTS.each do |p|
    prep_ok = prepare(p)
    $stderr.puts("#{p} prep failed") unless prep_ok
    next unless prep_ok

    build_ok = build(p)
    build_ok ? (build_succeeded << p) : (build_failed << p)
    $stderr.puts("#{p} build failed") unless build_ok
  end

  unless build_succeeded.empty?
    $stderr.puts("The following projects built successfully: #{build_succeeded.join(', ')}")
  end

  unless build_failed.empty?
    $stderr.puts("The following projects failed to build: #{build_failed.join(', ')}")
    exit(1)
  end
end

# ########################################
# Build commands

puts IN_TRAVIS

# bundle_all
# build_all
