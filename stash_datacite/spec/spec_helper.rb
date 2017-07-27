# ------------------------------------------------------------
# Simplecov

# TODO: use `SimpleCov.start 'rails'` to check *full* coverage
require 'simplecov' if ENV['COVERAGE']

# ------------------------------------------------------------
# Rspec configuration

RSpec.configure do |config|
  config.raise_errors_for_deprecations!
  config.mock_with :rspec
end

require 'rspec_custom_matchers'

# ------------------------------------------------------------
# Stash

ENV['STASH_ENV'] = 'test'

require 'stash_engine'
require 'stash_datacite'

puts $LOAD_PATH
